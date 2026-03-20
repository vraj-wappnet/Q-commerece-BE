import { BadRequestException, Injectable, Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "./entity/order.entity";
import { OrderItem } from "./entity/order-item.entity";
import { Cart } from "src/cart/entity/cart.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { NotificationType, OrderStatus } from "src/common/enum/status.enum";
import { User } from "src/auth/entity/user.entity";
import { DeliveryProfile } from "src/delivery_profiles/entity/delivery-profile.entity";
import { Product } from "src/products/entity/product.entity";
import { OrdersNodule } from "./orders.module";
import { NotificationService } from "../notifications/notification.service";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,

    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,

    @InjectRepository(Cart)
    private cartRepo: Repository<Cart>,

    @InjectRepository(Product)
    private productRepo: Repository<Product>,

    @InjectRepository(DeliveryProfile)
    private deliveryProfileRepo: Repository<DeliveryProfile>,

    private notificationService: NotificationService,
  ) {}

  async createOrder(dto: CreateOrderDto, user) {
    const cart = await this.cartRepo.findOne({
      where: { user: { id: user.id }, isActive: true },
      relations: ["items", "items.product"],
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

    const order = this.orderRepo.create({
      user: { id: user.id },
      totalItems: cart.totalItems,
      totalAmount: cart.totalAmount,
      addressLine1: dto.addressLine1,
      addressLine2: dto.addressLine2,
      city: dto.city,
      state: dto.state,
      country: dto.country,
      pincode: dto.pincode,
      latitude: dto.latitude,
      longitude: dto.longitude,
      paymentMethod: dto.paymentMethod,
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

    for (const item of cart.items){
      const sellerId = item.product.shop.seller.id;
      await this.notificationService.sendNotification({
        user : {id : sellerId},
        title : "New Order",
        message : "You have a new order",
        type : NotificationType.ORDER_PLACED
      }) 
    }

    return saveOrder;
  }

  async getMyOrders(user) {
    return this.orderRepo.find({
      where: { user: { id: user.id } },
      relations: ["items", "items.product"],
      order: { createdAt: "DESC" },
    });
  }

  async getOrderById(id: number, user) {
    const order = await this.orderRepo.findOne({
      where: { id, user: { id: user.id } },
      relations: ["items", "items.product"],
    });
  }

  async getAllOrders() {
    return this.orderRepo.find({
      relations: ["items", "items.product", "user"],
      order: { createdAt: "DESC" },
    });
  }

  async updateOrderStatus(id: number, status: OrderStatus) {
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

  async cancelOrder(id: number, user, reason: string) {
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

  async assignDeliveryPerson(orderId : number){
    const order = await this.orderRepo.findOne({
      where : {id : orderId}
    })

    if(!order){
      throw new BadRequestException("Order not found");
    }

    const orderlat = 23.0225;
    const orderLong = 72.5714;

    const result = await this.orderRepo.query(`
      SELECT 
      dp."userId",
      (
      6371 * acos(
      
      cos(radian($1)) *
      cos(radian(dp.latitude)) *
      cos(radian(dp.longitude) - radian($2)) +
      sin(radian($1)) *
      sin(radian(dp.latitude))
      )
      ) As distance

      FROM delivery_profile dp
      JOIN "user" u ON u.id  = dp."userId"
      WHERE 
     u.role = 'delivery'
     AND u.isVerified = true
     AND u.adminApproved = true
     AND dp.isAvailable = true
     AND dp.latitude IS NOT NULL
     AND dp.longitude IS NOT NULL
     ORDER BY distance ASC
     LIMIT 1;
      `,[orderlat, orderLong]);

      if(!result || result.length === 0){
        throw new BadRequestException("No delivery person found");
      }

      const deliveryUserId = result[0].userId;
      
      // Mark delivery person as busy
      await this.deliveryProfileRepo.update(
        { user: { id: deliveryUserId } },
        { isAvailable: false }
      );
      
      order.deliveryPerson = {id : deliveryUserId} as User;
      order.assignedAt = new Date();
      order.status = OrderStatus.ASSIGNED;

      return this.orderRepo.save(order);
  }

  async getSellerOrder (user){
    const orders = await this.orderRepo
    .createQueryBuilder('order')
    .leftJoinAndSelect('order.items', 'item')
    .leftJoinAndSelect('item.product','product')
    .leftJoinAndSelect('product.shop','shop')
    .leftJoinAndSelect('shop.seller' ,'seller')
    .leftJoinAndSelect('order.user', 'customer')
    .orderBy('order.createdAt', 'DESC')
    .getMany();

    const filteredOrders = orders
    .map((order) => {
      const sellerItems = order.items.filter(
        (item) => item.product?.shop?.seller?.id === user.id,
      )

      if(sellerItems.length === 0) return null;

      return {
        orderId : order.id,
        customer : order.user,
        status : order.status,
        createdAt : order.createdAt,
        items : sellerItems,
      }
    })
    .filter(Boolean)

    return filteredOrders;
  }
}
