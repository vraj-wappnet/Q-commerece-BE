import { Order } from "../entity/order.entity";
import { OrderItem } from "../entity/order-item.entity";
import { 
  OrderVm, 
  OrderItemVm, 
  OrderSummaryVm, 
  OrderTrackVm, 
  OrderCreateVm 
} from "../vm/order.vm";
import { OrderStatus, PaymentStatus, paymentMethod } from "src/common/enum/status.enum";

export class OrderMapper {
  static toOrderItemVm(orderItem: OrderItem): OrderItemVm {
    return {
      id: orderItem.id,
      product: {
        id: orderItem.product.id,
        name: orderItem.product.name,
        images: orderItem.product.images || [],
        sellingPrice: Number(orderItem.product.sellingPrice),
      },
      quantity: orderItem.quantity,
      price: Number(orderItem.price),
      totalPrice: Number(orderItem.totalPrice),
    };
  }

  static toOrderVm(order: Order): OrderVm {
    return {
      id: order.id,
      user: order.user ? {
        id: order.user.id,
        firstName: order.user.firstName,
        lastName: order.user.lastName,
        email: order.user.email,
        mobile: order.user.mobile,
      } : undefined,
      items: order.items ? order.items.map(item => this.toOrderItemVm(item)) : [],
      totalAmount: Number(order.totalAmount),
      deliveryCharge: Number(order.deliveryCharge),
      totalItems: order.totalItems,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      deliveryAddress: {
        addressLine1: order.addressLine1,
        addressLine2: order.addressLine2,
        city: order.city,
        state: order.state,
        country: order.country,
        pincode: order.pincode,
        latitude: Number(order.latitude),
        longitude: Number(order.longitude),
      },
      isPaid: order.isPaid,
      deliveryPerson: order.deliveryPerson ? {
        id: order.deliveryPerson.id,
        firstName: order.deliveryPerson.firstName,
        lastName: order.deliveryPerson.lastName,
        mobile: order.deliveryPerson.mobile,
      } : undefined,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      statusLabel: this.getStatusLabel(order.status),
      paymentStatusLabel: this.getPaymentStatusLabel(order.paymentStatus),
      paymentMethodLabel: this.getPaymentMethodLabel(order.paymentMethod),
    };
  }

  static toOrderSummaryVm(order: Order): OrderSummaryVm {
    return {
      id: order.id,
      customerName: order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Unknown',
      totalAmount: Number(order.totalAmount),
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalItems: order.totalItems,
      createdAt: order.createdAt,
      statusLabel: this.getStatusLabel(order.status),
    };
  }

  static toOrderTrackVm(order: Order): OrderTrackVm {
    return {
      id: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      totalAmount: Number(order.totalAmount),
      deliveryCharge: Number(order.deliveryCharge),
      deliveryAddress: {
        addressLine1: order.addressLine1,
        addressLine2: order.addressLine2,
        city: order.city,
        state: order.state,
        country: order.country,
        pincode: order.pincode,
        latitude: Number(order.latitude),
        longitude: Number(order.longitude),
      },
      items: order.items ? order.items.map(item => this.toOrderItemVm(item)) : [],
      customer: order.user ? {
        name: `${order.user.firstName} ${order.user.lastName}`,
        email: order.user.email,
        mobile: order.user.mobile,
      } : undefined,
      deliveryPerson: order.deliveryPerson ? {
        name: `${order.deliveryPerson.firstName} ${order.deliveryPerson.lastName}`,
        mobile: order.deliveryPerson.mobile,
      } : undefined,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  static toOrderVmList(orders: Order[]): OrderVm[] {
    return orders.map(order => this.toOrderVm(order));
  }

  static toOrderSummaryVmList(orders: Order[]): OrderSummaryVm[] {
    return orders.map(order => this.toOrderSummaryVm(order));
  }

  static toOrderTrackVmList(orders: Order[]): OrderTrackVm[] {
    return orders.map(order => this.toOrderTrackVm(order));
  }

  private static getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pending';
      case OrderStatus.CONFIRMED:
        return 'Confirmed';
      case OrderStatus.PACKED:
        return 'Packed';
      case OrderStatus.OUT_FOR_DELIVERY:
        return 'Out for Delivery';
      case OrderStatus.DELIVERED:
        return 'Delivered';
      case OrderStatus.ASSIGNED:
        return 'Assigned';
      case OrderStatus.CANCELLED:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  private static getPaymentStatusLabel(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.PENDING:
        return 'Pending';
      case PaymentStatus.PROCESSING:
        return 'Processing';
      case PaymentStatus.COMPLETED:
        return 'Completed';
      case PaymentStatus.FAILED:
        return 'Failed';
      case PaymentStatus.REFUNDED:
        return 'Refunded';
      default:
        return 'Unknown';
    }
  }

  private static getPaymentMethodLabel(method: paymentMethod): string {
    switch (method) {
      case paymentMethod.CASH_ON_DELIVERY:
        return 'Cash on Delivery';
      case paymentMethod.ONLINE_PAYMENT:
        return 'Online Payment';
      default:
        return 'Unknown';
    }
  }
}
