import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cart } from "./entity/cart.entity";
import { Repository } from "typeorm";
import { CartItem } from "./entity/cart-item.entity";
import { Product } from "src/products/entity/product.entity";
import { AddToCartDto } from "./dto/add-to-cart.dto";
import { UpdateCartDto } from "./dto/update-cart.dto";

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepo: Repository<Cart>,

    @InjectRepository(CartItem)
    private cartItemRepo: Repository<CartItem>,

    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async getOrCreateCart(user) {
    let cart = await this.cartRepo.findOne({
      where: { user: { id: user.id }, isActive: true },
      relations: ["items", "items.product"],
    });

    if (!cart) {
      cart = this.cartRepo.create({
        user: { id: user.id },
      });
      cart = await this.cartRepo.save(cart);
      cart.items = [];
    }

    return cart;
  }

  async addToCart(dto: AddToCartDto, user) {
    const productId = String(dto.productId);
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });

    if (!product || !product.isAvailable) {
      throw new BadRequestException("Product not available");
    }

    const cart = await this.getOrCreateCart(user);
    const cartItems = cart.items ?? [];
    let item = cartItems.find((i) => String(i.product.id) === productId);
    const unitPrice = Number(product.sellingPrice);

    if (item) {
      item.quantity += dto.quantity;
      item.price = unitPrice as any;
      item.totalPrice = item.quantity * unitPrice;
      await this.cartItemRepo.save(item);
    } else {
      item = this.cartItemRepo.create({
        cart,
        product,
        quantity: dto.quantity,
        price: unitPrice as any,
        totalPrice: dto.quantity * unitPrice,
      });
      await this.cartItemRepo.save(item);
    }

    // Ensure cart has the item reference (helpful right after creating a new cart).
    if (!cartItems.some((i) => i.id === item.id)) {
      cart.items = [...cartItems, item];
      await this.cartRepo.save(cart);
    }

    return this.recalculateCart(cart.id);
  }

  async updateCart(dto: UpdateCartDto, user) {
    const cart = await this.getOrCreateCart(user);
    const productId = String(dto.productId);
    const item = await this.cartItemRepo.findOne({
      where: { cart: { id: cart.id }, product: { id: productId } },
    });

    if (!item) {
      throw new BadRequestException("Item not in cart");
    }

    if (dto.quantity <= 0) {
      await this.cartItemRepo.delete(item.id);
    } else {
      item.quantity = dto.quantity;
      item.totalPrice = item.quantity * Number(item.price);
      await this.cartItemRepo.save(item);
    }
    return this.recalculateCart(cart.id);
  }

  async removeItem(itemId: number, user) {
    const cart = await this.getOrCreateCart(user);

    const item = await this.cartItemRepo.findOne({
      where: { id: itemId, cart: { id: cart.id } },
    });

    if (!item) {
      throw new BadRequestException("Item not in cart");
    }

    await this.cartItemRepo.delete(item.id);
    return this.recalculateCart(cart.id);
  }

  async recalculateCart(cartId: number) {
    const cart = await this.cartRepo.findOne({
      where: { id: cartId },
      relations: ["items"],
    });

    if (!cart) {
      throw new BadRequestException("Cart not found");
    }

    let totalAmount = 0;
    let totalItems = 0;

    for (const item of cart.items ?? []) {
      totalAmount += Number(item.totalPrice) || 0;
      totalItems += Number(item.quantity) || 0;
    }

    cart.totalAmount = totalAmount;
    cart.totalItems = totalItems;

    await this.cartRepo.save(cart);
    return cart;
  }
}
