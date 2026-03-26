import { Product } from "../entity/product.entity";
import { 
  ProductVm, 
  ProductSummaryVm, 
  ProductCreateVm, 
  ProductUpdateVm 
} from "../vm/product.vm";

export class ProductMapper {
  static toProductVm(product: Product): ProductVm {
    const discountPercentage = product.discountPercentage || 0;
    const discountAmount = discountPercentage > 0 ? 
      (product.mrp * discountPercentage) / 100 : 0;
    const youSave = discountAmount;
    
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      longDescription: product.longDescription,
      pricing: {
        mrp: Number(product.mrp),
        sellingPrice: Number(product.sellingPrice),
        discountPercentage: discountPercentage || undefined,
        discountAmount: discountAmount || undefined,
        youSave: youSave || undefined,
      },
      inventory: {
        stockQuantity: product.stockQuantity,
        isAvailable: product.isAvailable,
        lowStockThreshold: product.lowStockThreshold || undefined,
        stockStatus: this.getStockStatus(product.stockQuantity, product.lowStockThreshold),
      },
      unit: {
        unit: product.unit,
        unitValue: product.unitValue || undefined,
        packSize: product.packSize || undefined,
      },
      images: product.images || [],
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
      } : undefined,
      subCategory: product.subCategory ? {
        id: product.subCategory.id,
        name: product.subCategory.name,
      } : undefined,
      brand: product.brand || undefined,
      isVeg: product.isVeg,
      expiryDays: product.expiryDays || undefined,
      shop: {
        id: product.shop.id,
        shopName: product.shop.shopName,
        addressLine1: product.shop.addressLine1,
        city: product.shop.city,
        state: product.shop.state,
      },
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  static toProductSummaryVm(product: Product): ProductSummaryVm {
    const discountPercentage = product.discountPercentage || 0;
    
    return {
      id: product.id,
      name: product.name,
      images: product.images || [],
      pricing: {
        sellingPrice: Number(product.sellingPrice),
        mrp: Number(product.mrp),
        discountPercentage: discountPercentage || undefined,
      },
      stockStatus: this.getStockStatus(product.stockQuantity, product.lowStockThreshold),
      isAvailable: product.isAvailable,
      shopName: product.shop.shopName,
      categoryName: product.category?.name,
    };
  }

  static toProductVmList(products: Product[]): ProductVm[] {
    return products.map(product => this.toProductVm(product));
  }

  static toProductSummaryVmList(products: Product[]): ProductSummaryVm[] {
    return products.map(product => this.toProductSummaryVm(product));
  }

  static toProductEntity(createVm: ProductCreateVm): Partial<Product> {
    return {
      name: createVm.name,
      description: createVm.description,
      longDescription: createVm.longDescription,
      mrp: createVm.mrp,
      sellingPrice: createVm.sellingPrice,
      discountPercentage: createVm.discountPercentage,
      stockQuantity: createVm.stockQuantity,
      lowStockThreshold: createVm.lowStockThreshold,
      unit: createVm.unit,
      unitValue: createVm.unitValue,
      packSize: createVm.packSize,
      brand: createVm.brand,
      isVeg: createVm.isVeg,
      expiryDays: createVm.expiryDays,
      images: createVm.images,
      shop: { id: createVm.shopId } as any,
    };
  }

  static updateProductEntity(updateVm: ProductUpdateVm): Partial<Product> {
    const entity: Partial<Product> = {};
    
    Object.keys(updateVm).forEach(key => {
      const value = updateVm[key as keyof ProductUpdateVm];
      if (value !== undefined) {
        entity[key as keyof Product] = value as any;
      }
    });
    
    return entity;
  }

  private static getStockStatus(stockQuantity: number, lowStockThreshold?: number): string {
    if (stockQuantity === 0) {
      return 'Out of Stock';
    }
    
    if (lowStockThreshold && stockQuantity <= lowStockThreshold) {
      return 'Low Stock';
    }
    
    return 'In Stock';
  }
}
