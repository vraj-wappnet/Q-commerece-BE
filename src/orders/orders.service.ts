import { BadRequestException, Injectable, Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "./entity/order.entity";
import { OrderItem } from "./entity/order-item.entity";
import { Cart } from "src/cart/entity/cart.entity";
import { CartItem } from "src/cart/entity/cart-item.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { AssignmentStatus, NotificationType, OrderStatus, PaymentStatus, paymentMethod } from "src/common/enum/status.enum";
import { User } from "src/auth/entity/user.entity";
import { DeliveryProfile } from "src/delivery_profiles/entity/delivery-profile.entity";
import { DeliveryAssignment } from "src/order_delivery_assignment/entity/delivery_assignment.entity";
import { Product } from "src/products/entity/product.entity";
import { NotificationService } from "../notifications/notification.service";
import { UserRole } from "src/common/enum/roles.enum";
import { join } from "path";
import * as ejs from 'ejs';
import * as puppeteer from 'puppeteer';
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { StripeService } from "src/stripe/stripe.service";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,

    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,

    @InjectRepository(Cart)
    private cartRepo: Repository<Cart>,

    @InjectRepository(CartItem)
    private cartItemRepo: Repository<CartItem>,

    @InjectRepository(Product)
    private productRepo: Repository<Product>,

    @InjectRepository(DeliveryProfile)
    private deliveryProfileRepo: Repository<DeliveryProfile>,

    @InjectRepository(DeliveryAssignment)
    private deliveryAssignmentRepo: Repository<DeliveryAssignment>,

    @InjectQueue('delivery')
    private deliveryQueue: Queue,

    private notificationService: NotificationService,
  ) { }

  async createOrder(dto: CreateOrderDto, user) {
    const cart = await this.cartRepo.findOne({
      where: { user: { id: user.id }, isActive: true },
      relations: ["items", "items.product", "items.product.shop", "items.product.shop.seller"],
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException("Cart is empty");
    }

    // Validate stock availability before creating order
    for (const cartItem of cart.items) {
      if (cartItem.quantity > cartItem.product.stockQuantity) {
        throw new BadRequestException(
          `Insufficient stock for product: ${cartItem.product.name}. Available: ${cartItem.product.stockQuantity}, Requested: ${cartItem.quantity}`
        );
      }
    }

    // Calculate delivery charge
    const deliveryCharge = cart.totalAmount < 600 ? 50 : 0;
    const finalAmount = parseFloat((cart.totalAmount + deliveryCharge).toFixed(2));

    const order = this.orderRepo.create({
      user: { id: user.id },
      totalItems: cart.totalItems,
      totalAmount: finalAmount,
      deliveryCharge: parseFloat(deliveryCharge.toFixed(2)),
      addressLine1: dto.addressLine1,
      addressLine2: dto.addressLine2,
      city: dto.city,
      state: dto.state,
      country: dto.country,
      pincode: dto.pincode,
      latitude: dto.latitude,
      longitude: dto.longitude,
      paymentMethod: dto.paymentMethod,
      paymentStatus: dto.paymentMethod === paymentMethod.CASH_ON_DELIVERY 
        ? PaymentStatus.PENDING 
        : PaymentStatus.PENDING,
    });

    const saveOrder = await this.orderRepo.save(order);

    const orderItems = cart.items.map((item) =>
      this.orderItemRepo.create({
        order: saveOrder,
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
      }),
    );

    await this.orderItemRepo.save(orderItems);

    // Reduce stock quantities for each product
    for (const orderItem of orderItems) {
      await this.productRepo.decrement(
        { id: orderItem.product.id },
        'stockQuantity',
        orderItem.quantity
      );

      // Check if product is out of stock and update availability
      const updatedProduct = await this.productRepo.findOne({
        where: { id: orderItem.product.id }
      });

      if (updatedProduct && updatedProduct.stockQuantity <= 0) {
        await this.productRepo.update(
          { id: orderItem.product.id },
          { isAvailable: false }
        );
      }
    }

    cart.isActive = false;
    await this.cartRepo.save(cart);

    // Clear all cart items
    await this.cartItemRepo.delete({ cart: { id: cart.id } });

    for (const item of cart.items) {
      const sellerId = item.product.shop.seller.id;

      await this.notificationService.sendNotification({
        user: { id: sellerId },
        title: "New Order",
        message: "You have a new order",
        type: NotificationType.ORDER_PLACED
      });
    }

    await this.autoAssignDelivery(saveOrder.id);
    return saveOrder;
  }

  async getMyOrders(user) {
    return this.orderRepo.find({
      where: { user: { id: user.id } },
      relations: ["items", "items.product"],
      order: { createdAt: "DESC" },
    });
  }

  async getOrderById(id: string, user) {
    const order = await this.orderRepo.findOne({
      where: { id, user: { id: user.id } },
      relations: ["items", "items.product"],
    });
    return order;
  }

  async getAllOrders() {
    return this.orderRepo.find({
      relations: ["items", "items.product", "user"],
      order: { createdAt: "DESC" },
    });
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['deliveryPerson']
    });

    if (!order) {
      throw new BadRequestException("Order not found");
    }

    const previousStatus = order.status;
    order.status = status;

    // When order is completed, free the delivery person
    if (status === OrderStatus.DELIVERED &&
      previousStatus !== OrderStatus.DELIVERED &&
      order.deliveryPerson) {
      await this.deliveryProfileRepo.update(
        { user: { id: order.deliveryPerson.id } },
        { isAvailable: true }
      );
    }

    await this.notificationService.sendNotification({
      user: { id: order.user.id },
      title: "Order Status Updated",
      message: `Your order status has been updated to ${OrderStatus[status]}`,
      type: NotificationType.ORDER_STATUS
    });

    return this.orderRepo.save(order);
  }

  async cancelOrder(id: string, user, reason: string) {
    const order = await this.orderRepo.findOne({
      where: { id, user: { id: user.id } },
      relations: ["items", "items.product"],
    });

    if (!order) {
      throw new BadRequestException("Order not found");
    }

    if (
      order.status === OrderStatus.OUT_FOR_DELIVERY ||
      order.status === OrderStatus.DELIVERED
    ) {
      throw new BadRequestException(
        "Cannot cancel order that is out for delivery or already delivered",
      );
    }

    // Restore stock quantities for each product
    for (const orderItem of order.items) {
      await this.productRepo.increment(
        { id: orderItem.product.id },
        'stockQuantity',
        orderItem.quantity
      );

      // Check if product should be marked as available again
      const updatedProduct = await this.productRepo.findOne({
        where: { id: orderItem.product.id }
      });

      if (updatedProduct && updatedProduct.stockQuantity > 0 && !updatedProduct.isAvailable) {
        await this.productRepo.update(
          { id: orderItem.product.id },
          { isAvailable: true }
        );
      }
    }

    order.status = OrderStatus.CANCELLED;
    order.cancelReason = reason;
    order.cancelledAt = new Date();

    return this.orderRepo.save(order);
  }

  async assignDeliveryPerson(orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId }
    })

    if (!order) {
      throw new BadRequestException("Order not found");
    }

    const orderlat = 23.0225;
    const orderLong = 72.5714;
    const availabilityColumnCheck = await this.orderRepo.query(
      `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'delivery_profile'
          AND lower(column_name) = 'isavailable'
      ) AS "hasIsAvailable";
      `,
    );
    const hasIsAvailableColumn = Boolean(availabilityColumnCheck?.[0]?.hasIsAvailable);
    const availabilityCondition = hasIsAvailableColumn ? 'AND dp."isAvailable" = true' : '';

    const result = await this.orderRepo.query(`
      SELECT 
      dp."userId",
      (
      6371 * acos(
      
      cos(radians($1::double precision)) *
      cos(radians(dp.latitude::double precision)) *
      cos(radians(dp.longitude::double precision) - radians($2::double precision)) +
      sin(radians($1::double precision)) *
      sin(radians(dp.latitude::double precision))
      )
      ) As distance

      FROM delivery_profile dp
      JOIN "user" u ON u.id  = dp."userId"
     WHERE 
     u.role = $3
     AND u."isVerified" = true
     AND u."adminApproved" = true
     ${availabilityCondition}
     AND dp.latitude IS NOT NULL
     AND dp.longitude IS NOT NULL
     ORDER BY distance ASC
     LIMIT 1;
      `, [orderlat, orderLong, UserRole.DELIVERY]);

    if (!result || result.length === 0) {
      const diagnostics = await this.orderRepo.query(
        `
          SELECT
            COUNT(*)::int AS "totalProfiles",
            COUNT(*) FILTER (WHERE u.role = $1)::int AS "deliveryRoleProfiles",
            COUNT(*) FILTER (WHERE u.role = $1 AND u."isVerified" = true)::int AS "verifiedDeliveryProfiles",
            COUNT(*) FILTER (WHERE u.role = $1 AND u."isVerified" = true AND u."adminApproved" = true)::int AS "approvedDeliveryProfiles",
            COUNT(*) FILTER (WHERE u.role = $1 AND u."isVerified" = true AND u."adminApproved" = true AND dp.latitude IS NOT NULL AND dp.longitude IS NOT NULL)::int AS "locationReadyProfiles"
          FROM delivery_profile dp
          JOIN "user" u ON u.id = dp."userId";
          `,
        [UserRole.DELIVERY],
      );

      const stats = diagnostics?.[0];
      throw new BadRequestException({
        message: "No delivery person found",
        reason:
          "No delivery user matches all required filters (role, verification, admin approval, and location).",
        stats,
      });
    }

    const deliveryUserId = result[0].userId;

    if (hasIsAvailableColumn) {
      await this.orderRepo.query(
        `
          UPDATE delivery_profile
          SET "isAvailable" = false
          WHERE "userId" = $1;
          `,
        [deliveryUserId],
      );
    }

    order.deliveryPerson = { id: deliveryUserId } as User;
    order.assignedAt = new Date();
    order.status = OrderStatus.ASSIGNED;

    return this.orderRepo.save(order);
  }

  async getSellerOrder(user) {
    const orders = await this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('item.product', 'product')
      .leftJoinAndSelect('product.shop', 'shop')
      .leftJoinAndSelect('shop.seller', 'seller')
      .leftJoinAndSelect('order.user', 'customer')
      .orderBy('order.createdAt', 'DESC')
      .getMany();

    const filteredOrders = orders
      .map((order) => {
        const sellerItems = order.items.filter(
          (item) => item.product?.shop?.seller?.id === user.id,
        )

        if (sellerItems.length === 0) return null;

        return {
          orderId: order.id,
          customer: order.user,
          status: order.status,
          createdAt: order.createdAt,
          items: sellerItems,
        }
      })
      .filter(Boolean)

    return filteredOrders;
  }

  async generateInvoice(orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['user', 'items', 'items.product', 'items.product.shop', 'items.product.shop.seller']
    });

    if (!order) {
      throw new BadRequestException("Order not found");
    }

    const formatEnumLabel = (value: string) =>
      value
        .split("_")
        .filter(Boolean)
        .map((word) => word[0] + word.slice(1).toLowerCase())
        .join(" ");

    const resolveOrderStatus = (rawStatus: unknown) => {
      if (rawStatus === null || rawStatus === undefined) return { statusLabel: "Pending", statusClass: "pending" };

      const mapped = (OrderStatus as any)[rawStatus as any];
      const statusName =
        typeof mapped === "string" ? mapped : typeof rawStatus === "string" ? rawStatus : String(rawStatus);

      const normalized = statusName.toUpperCase();
      const statusLabel = formatEnumLabel(normalized.replace(/\s+/g, "_"));

      const statusClass =
        normalized === "PENDING"
          ? "pending"
          : normalized === "DELIVERED"
            ? "delivered"
            : normalized === "CANCELLED"
              ? "cancelled"
              : normalized === "OUT_FOR_DELIVERY"
                ? "shipped"
                : "processing";

      return { statusLabel, statusClass };
    };

    const resolvePaymentMethod = (rawPaymentMethod: unknown) => {
      if (rawPaymentMethod === null || rawPaymentMethod === undefined) return "N/A";
      const mapped = (paymentMethod as any)[rawPaymentMethod as any];
      const methodName =
        typeof mapped === "string" ? mapped : typeof rawPaymentMethod === "string" ? rawPaymentMethod : String(rawPaymentMethod);
      return formatEnumLabel(methodName.toUpperCase());
    };

    const { statusLabel, statusClass } = resolveOrderStatus((order as any).status);
    const paymentMethodLabel = resolvePaymentMethod((order as any).paymentMethod);

    const normalizedItems = (order.items ?? []).map((item: any) => {
      const unitPrice = Number(item.price);
      const lineTotal = Number(item.totalPrice ?? unitPrice * Number(item.quantity ?? 0));

      return {
        ...item,
        unitPrice,
        lineTotal,
      };
    });

    const totalAmountNumber = Number((order as any).totalAmount);

    const customerName =
      [order.user?.firstName, order.user?.lastName].filter(Boolean).join(" ").trim() ||
      (order.user as any)?.name ||
      "N/A";
    const customerPhone = (order.user as any)?.mobile || (order.user as any)?.phone || "N/A";

    // Transform data to match template expectations
    const orderData = {
      ...order,
      customer: {
        ...order.user,
        name: customerName,
        phone: customerPhone,
      },
      statusLabel,
      statusClass,
      paymentMethodLabel,
      items: normalizedItems,
      totalAmountNumber,
    };

    // Render EJS template
    const filePath = join(process.cwd(), 'src/orders/templates/invoice.ejs');
    const html = await ejs.renderFile(filePath, { order: orderData });

    // Launch browser
    const browser = await puppeteer.launch({
      browser: 'chrome',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
   

    const footerTemplate = `
      <div style="width:100%; font-family: Inter, Arial, sans-serif; font-size:10px; color:#6B7280; padding:0 14mm; display:flex; justify-content:space-between; align-items:center; border-top:1px solid #E5E7EB; height:100%;">
        <div>
          <div>© 2026 SwiftMart Quick Commerce. All rights reserved.</div>
          <div style="font-weight:600; color:#2563EB;">Freshness Delivered Fast ⚡</div>
        </div>
        <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
      </div>
    `;

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      footerTemplate,
      margin: {
        top: '110px',
        right: '14mm',
        bottom: '60px',
        left: '14mm'
      },
    });

    await browser.close();
    return pdf;
  }

  async autoAssignDelivery(orderId: string) {
    const existing = await this.deliveryAssignmentRepo.findOne({
      where: {
        order: { id: orderId },
        status: AssignmentStatus.PENDING
      }
    })

    if (existing) return;

    const deliveryuser = await this.orderRepo.query(
      `
    SELECT dp."userId" 
    FROM delivery_profile dp
    JOIN "user" u ON u.id = dp."userId"
    WHERE 
      u.role = $1
      AND dp."isAvailable" = true
    ORDER BY RANDOM()
    LIMIT 1
      `, [UserRole.DELIVERY],
    );

    if (!deliveryuser.length) return;

    const deliveryId = deliveryuser[0].userId;

    const assignment = this.deliveryAssignmentRepo.create({
      order: { id: orderId },
      user: { id: deliveryId }
    })

    await this.deliveryAssignmentRepo.save(assignment);
    await this.notificationService.sendNotification({
      user: { id: deliveryId },
      title: "New Delivery Request",
      message: `Order #${orderId}`,
      type: NotificationType.ORDER_ASSIGNED
    })

    await this.deliveryQueue.add(
      'delivery-timeout',
      { orderId, deliveryId },
      { delay: 3000, removeOnComplete: true },
    )
  }

  async acceptDelivery(orderId: string, user) {
    const assignment = await this.deliveryAssignmentRepo.findOne({
      where: {
        order: { id: orderId },
        user: { id: user.userId },
        status: AssignmentStatus.PENDING
      }
    })

    if (!assignment) {
      throw new BadRequestException("No assignment Found")
    };

    assignment.status = AssignmentStatus.ACCEPTED;
    await this.deliveryAssignmentRepo.save(assignment);

    await this.orderRepo.update(orderId, {
      deliveryPerson: { id: user.userId },
      status: OrderStatus.OUT_FOR_DELIVERY
    })

    return { message: "Delivery accepted successfully" };
  }

  async rejectDelivery(orderId: string, user) {
    const assignment = await this.deliveryAssignmentRepo.findOne({
      where: {
        order: { id: orderId },
        user: { id: user.userId },
        status: AssignmentStatus.PENDING
      }
    })

    if (!assignment) {
      throw new BadRequestException("No assignment Found")
    };

    assignment.status = AssignmentStatus.REJECTED;
    await this.deliveryAssignmentRepo.save(assignment);

    await this.assignDeliveryPerson(orderId);

    return { message: 'Delivery rejected & reassigned' };
  }

  async assignNextDelivery(orderId: string) {
    const rejectedIds = await this.deliveryAssignmentRepo.find({
      where: { order: { id: orderId } },
      relations: ['user']
    })

    const rejectUserIds = rejectedIds.map(a => a.user.id)

    const nextDelivery = await this.orderRepo.query(
    `
    SELECT dp."userId"
    FROM delivery_profile dp
    JOIN "user" u ON u.id = dp."userId"
    WHERE 
      u.role = $1
      AND dp."isAvailable" = true
      AND dp."userId" != ALL($2)
    LIMIT 1
    `,
    [UserRole.DELIVERY, rejectUserIds],
  );


    if (!nextDelivery.length) {
      return;
    }

    const newAssignment = await this.deliveryAssignmentRepo.create({
      order: { id: orderId },
      user: { id: nextDelivery[0].userId },
    })

    await this.deliveryAssignmentRepo.save(newAssignment)

    await this.notificationService.sendNotification({
      user: { id: nextDelivery[0].userId },
      title: 'New Delivery Request',
      message: `Order #${orderId} assigned to you`,
      type: NotificationType.ORDER_ASSIGNED,
    })

  }

  async confirmPayment(orderId : string){
    const order = await this.orderRepo.findOne({
      where : {
        id : orderId
      }
    })

    if(!order){
      throw new BadRequestException("Order Not Found")
    }

    order.isPaid = true;
    order.paymentStatus = PaymentStatus.COMPLETED;
    order.status = OrderStatus.CONFIRMED;

    await this.orderRepo.save(order);

    //assign delivery after payment
    await this.autoAssignDelivery(order.id)
      return { message: 'Payment successful & order confirmed' };

  }

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId }
    });

    if (!order) {
      throw new BadRequestException("Order not found");
    }

    order.paymentStatus = paymentStatus;
    
    // Update isPaid based on payment status
    if (paymentStatus === PaymentStatus.COMPLETED) {
      order.isPaid = true;
    } else if (paymentStatus === PaymentStatus.FAILED || paymentStatus === PaymentStatus.REFUNDED) {
      order.isPaid = false;
    }

    await this.notificationService.sendNotification({
      user: { id: order.user.id },
      title: "Payment Status Updated",
      message: `Your payment status has been updated to ${PaymentStatus[paymentStatus]}`,
      type: NotificationType.ORDER_STATUS
    });

    return this.orderRepo.save(order);
  }
}
