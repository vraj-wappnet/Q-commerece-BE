export enum OrderStatus {
  PENDING = 1,
  CONFIRMED = 2,
  PACKED = 3,
  OUT_FOR_DELIVERY = 4,
  DELIVERED = 5,
  ASSIGNED = 6,
  CANCELLED = 7,
}

export enum paymentMethod{
  CASH_ON_DELIVERY = 1,
  ONLINE_PAYMENT = 2,
}

export enum NotificationType {
  ORDER_PLACED = 1,
  ORDER_STATUS = 2,
}