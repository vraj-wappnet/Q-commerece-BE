import { BadRequestException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cart } from "./entity/cart.entity";
import { Repository } from "typeorm";
import { CartItem } from "./entity/cart-item.entity";
import { Product } from "src/modules/products/entity/product.entity";
import { AddToCartDto } from "./dto/add-to-cart.dto";
import { UpdateCartDto } from "./dto/update-cart.dto";
import { MESSAGES } from "src/common/constant/message";
import { FilterCartDto } from "./dto/filter-cart.dto";

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

  async getAllCarts(query: FilterCartDto = {}) {
    const {
      search,
      userId,
      isActive,
      minTotalAmount,
      maxTotalAmount,
      createdFrom,
      createdTo,
      updatedFrom,
      updatedTo,
      sortBy = "createdAt",
      sortOrder = "DESC",
      page = 1,
      limit = 10,
    } = query ?? {};

    const safeLimit = Math.min(Number(limit) || 10, 100);
    const safePage = Math.max(Number(page) || 1, 1);
    const safeSortOrder = String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC";

    const createdFromDate = createdFrom ? new Date(createdFrom) : null;
    const createdToDate = createdTo ? new Date(createdTo) : null;
    const updatedFromDate = updatedFrom ? new Date(updatedFrom) : null;
    const updatedToDate = updatedTo ? new Date(updatedTo) : null;

    if (createdFrom && Number.isNaN(createdFromDate?.getTime())) {
      throw new BadRequestException("Invalid createdFrom date");
    }
    if (createdTo && Number.isNaN(createdToDate?.getTime())) {
      throw new BadRequestException("Invalid createdTo date");
    }
    if (updatedFrom && Number.isNaN(updatedFromDate?.getTime())) {
      throw new BadRequestException("Invalid updatedFrom date");
    }
    if (updatedTo && Number.isNaN(updatedToDate?.getTime())) {
      throw new BadRequestException("Invalid updatedTo date");
    }
    if (createdFromDate && createdToDate && createdFromDate > createdToDate) {
      throw new BadRequestException("createdFrom must be before or equal to createdTo");
    }
    if (updatedFromDate && updatedToDate && updatedFromDate > updatedToDate) {
      throw new BadRequestException("updatedFrom must be before or equal to updatedTo");
    }

    const qb = this.cartRepo
      .createQueryBuilder("cart")
      .leftJoinAndSelect("cart.user", "user")
      .leftJoinAndSelect("cart.items", "items")
      .leftJoinAndSelect("items.product", "product");

    if (search) {
      qb.andWhere(
        "(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    if (userId) {
      qb.andWhere("user.id = :userId", { userId });
    }

    if (isActive !== undefined) {
      qb.andWhere("cart.isActive = :isActive", { isActive });
    }

    if (minTotalAmount !== undefined) {
      qb.andWhere("cart.totalAmount >= :minTotalAmount", { minTotalAmount });
    }

    if (maxTotalAmount !== undefined) {
      qb.andWhere("cart.totalAmount <= :maxTotalAmount", { maxTotalAmount });
    }

    if (createdFromDate) {
      qb.andWhere("cart.createdAt >= :createdFromDate", { createdFromDate });
    }

    if (createdToDate) {
      qb.andWhere("cart.createdAt <= :createdToDate", { createdToDate });
    }

    if (updatedFromDate) {
      qb.andWhere("cart.updatedAt >= :updatedFromDate", { updatedFromDate });
    }

    if (updatedToDate) {
      qb.andWhere("cart.updatedAt <= :updatedToDate", { updatedToDate });
    }

    // Avoid SQL injection on column name
    const allowedSortBy = new Set([
      "createdAt",
      "updatedAt",
      "totalAmount",
      "totalItems",
    ]);
    const sortColumn = allowedSortBy.has(sortBy) ? sortBy : "createdAt";

    qb.orderBy(`cart.${sortColumn}`, safeSortOrder);
    qb.skip((safePage - 1) * safeLimit).take(safeLimit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / safeLimit);

    return {
      statusCode: HttpStatus.OK,
      message: MESSAGES.CART.LIST_FETCHED,
      data: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
      data,
      },
    };
  }

  async getOrCreateCart(user) {
    const cart = await this.getOrCreateCartEntity(user);
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGES.CART.FETCHED,
      data: cart,
    };
  }

  private async getOrCreateCartEntity(user) {
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

    const cart = await this.getOrCreateCartEntity(user);
    const cartItems = cart.items ?? [];
    let item = cartItems.find((i) => String(i.product.id) === productId);
    const unitPrice = parseFloat(Number(product.sellingPrice).toFixed(2));

    // Calculate current quantity in cart
    const currentCartQuantity = item ? item.quantity : 0;
    const requestedQuantity = dto.quantity;
    const totalQuantity = currentCartQuantity + requestedQuantity;

    // Check if total quantity exceeds available stock
    if (totalQuantity > product.stockQuantity) {
      throw new BadRequestException(
        `Cannot add ${requestedQuantity} items. Only ${product.stockQuantity - currentCartQuantity} items available in stock.`
      );
    }

    if (item) {
      item.quantity += dto.quantity;
      item.price = unitPrice as any;
      item.totalPrice = parseFloat((item.quantity * unitPrice).toFixed(2));
      await this.cartItemRepo.save(item);
    } else {
      item = this.cartItemRepo.create({
        cart,
        product,
        quantity: dto.quantity,
        price: unitPrice as any,
        totalPrice: parseFloat((dto.quantity * unitPrice).toFixed(2)),
      });
      await this.cartItemRepo.save(item);
    }

    // Ensure cart has the item reference (helpful right after creating a new cart).
    if (!cartItems.some((i) => i.id === item.id)) {
      cart.items = [...cartItems, item];
      await this.cartRepo.save(cart);
    }

    const updatedCart = await this.recalculateCartEntity(cart.id);
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGES.CART.UPDATED,
      data: updatedCart,
    };
  }

  async updateCart(dto: UpdateCartDto, user) {
    const cart = await this.getOrCreateCartEntity(user);
    const productId = String(dto.productId);
    const item = await this.cartItemRepo.findOne({
      where: { cart: { id: cart.id }, product: { id: productId } },
      relations: ["product"],
    });

    if (!item) {
      throw new BadRequestException("Item not in cart");
    }

    // Check if requested quantity exceeds available stock
    if (dto.quantity > item.product.stockQuantity) {
      throw new BadRequestException(
        `Cannot update quantity to ${dto.quantity}. Only ${item.product.stockQuantity} items available in stock.`
      );
    }

    if (dto.quantity <= 0) {
      await this.cartItemRepo.delete(item.id);
    } else {
      item.quantity = dto.quantity;
      item.totalPrice = parseFloat((item.quantity * Number(item.price)).toFixed(2));
      await this.cartItemRepo.save(item);
    }
    const updatedCart = await this.recalculateCartEntity(cart.id);
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGES.CART.UPDATED,
      data: updatedCart,
    };
  }

  async removeItem(itemId: number, user) {
    const cart = await this.getOrCreateCartEntity(user);

    const item = await this.cartItemRepo.findOne({
      where: { id: itemId, cart: { id: cart.id } },
    });

    if (!item) {
      throw new BadRequestException("Item not in cart");
    }

    await this.cartItemRepo.delete(item.id);
    const updatedCart = await this.recalculateCartEntity(cart.id);
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGES.CART.UPDATED,
      data: updatedCart,
    };
  }

  private async recalculateCartEntity(cartId: number) {
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

    cart.totalAmount = parseFloat(totalAmount.toFixed(2));
    cart.totalItems = totalItems;

    await this.cartRepo.save(cart);
    return cart;
  }
}
