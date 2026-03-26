import { Cart } from "../entity/cart.entity";
import { CartItem } from "../entity/cart-item.entity";
import { CartVm, CartItemVm, CartSummaryVm } from "../vm/cart.vm";

export class CartMapper {
  static toCartItemVm(cartItem: CartItem): CartItemVm {
    return {
      id: cartItem.id,
      product: {
        id: cartItem.product.id,
        name: cartItem.product.name,
        images: cartItem.product.images || [],
        price: Number(cartItem.product.sellingPrice),
      },
      quantity: cartItem.quantity,
      price: Number(cartItem.price),
      totalPrice: Number(cartItem.price) * cartItem.quantity,
    };
  }

  static toCartVm(cart: Cart): CartVm {
    return {
      id: cart.id,
      user: cart.user ? {
        id: cart.user.id,
        firstName: cart.user.firstName,
        lastName: cart.user.lastName,
        email: cart.user.email,
        mobile: cart.user.mobile,
      } : undefined,
      items: cart.items ? cart.items.map(item => this.toCartItemVm(item)) : [],
      totalAmount: Number(cart.totalAmount),
      totalItems: cart.totalItems,
      isActive: cart.isActive,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  static toCartSummaryVm(cart: Cart): CartSummaryVm {
    return {
      id: cart.id,
      totalAmount: Number(cart.totalAmount),
      totalItems: cart.totalItems,
      isActive: cart.isActive,
    };
  }

  static toCartVmList(carts: Cart[]): CartVm[] {
    return carts.map(cart => this.toCartVm(cart));
  }

  static toCartSummaryVmList(carts: Cart[]): CartSummaryVm[] {
    return carts.map(cart => this.toCartSummaryVm(cart));
  }
}
