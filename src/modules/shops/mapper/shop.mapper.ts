import { Shop } from "../entity/shop.entity";
import { 
  ShopVm, 
  ShopSummaryVm, 
  ShopCreateVm, 
  ShopUpdateVm 
} from "../vm/shop.vm";

export class ShopMapper {
  static toShopVm(shop: Shop): ShopVm {
    return {
      id: shop.id,
      shopName: shop.shopName,
      address: {
        addressLine1: shop.addressLine1,
        addressLine2: shop.addressLine2,
        city: shop.city,
        state: shop.state,
        pinCode: shop.pinCode,
        country: shop.country,
      },
      pickupAddress: shop.pickupAddress,
      legalInfo: {
        shopLicense: shop.shopLicense,
        gstNumber: shop.gstNumber,
        panNumber: shop.panNumber,
        businessRegistrationNumber: shop.businessRegistrationNumber,
        fssaiNumber: shop.fssaiNumber,
      },
      bankInfo: {
        accountHolderName: shop.accountHolderName,
        accountNumber: shop.accountNumber,
        ifscCode: shop.ifscCode,
        bankName: shop.bankName,
        cancelledChequeImage: shop.cancelledChequeImage,
      },
      contactInfo: {
        alternatePhone: shop.alternatePhone,
        whatsappNumber: shop.whatsappNumber,
        websiteUrl: shop.websiteUrl,
        instagram: shop.instagram,
        facebook: shop.facebook,
      },
      seller: shop.seller ? {
        id: shop.seller.id,
        firstName: shop.seller.firstName,
        lastName: shop.seller.lastName,
        email: shop.seller.email,
        mobile: shop.seller.mobile,
      } : undefined,
      createdAt: shop.createdAt,
      isApproved: shop.seller?.adminApproved,
    };
  }

  static toShopSummaryVm(shop: Shop): ShopSummaryVm {
    return {
      id: shop.id,
      shopName: shop.shopName,
      city: shop.city,
      state: shop.state,
      ownerName: shop.seller ? `${shop.seller.firstName} ${shop.seller.lastName}` : 'Unknown',
      mobile: shop.seller?.mobile || '',
      isApproved: shop.seller?.adminApproved,
      productCount: shop.products ? shop.products.length : 0,
    };
  }

  static toShopVmList(shops: Shop[]): ShopVm[] {
    return shops.map(shop => this.toShopVm(shop));
  }

  static toShopSummaryVmList(shops: Shop[]): ShopSummaryVm[] {
    return shops.map(shop => this.toShopSummaryVm(shop));
  }

  static toShopEntity(createVm: ShopCreateVm, sellerId: string): Partial<Shop> {
    return {
      shopName: createVm.shopName,
      addressLine1: createVm.addressLine1,
      addressLine2: createVm.addressLine2,
      city: createVm.city,
      state: createVm.state,
      pinCode: createVm.pinCode,
      country: createVm.country || 'India',
      pickupAddress: createVm.pickupAddress,
      shopLicense: createVm.shopLicense,
      gstNumber: createVm.gstNumber,
      panNumber: createVm.panNumber,
      businessRegistrationNumber: createVm.businessRegistrationNumber,
      fssaiNumber: createVm.fssaiNumber,
      accountHolderName: createVm.accountHolderName,
      accountNumber: createVm.accountNumber,
      ifscCode: createVm.ifscCode,
      bankName: createVm.bankName,
      cancelledChequeImage: createVm.cancelledChequeImage,
      alternatePhone: createVm.alternatePhone,
      whatsappNumber: createVm.whatsappNumber,
      websiteUrl: createVm.websiteUrl,
      instagram: createVm.instagram,
      facebook: createVm.facebook,
      seller: { id: sellerId } as any,
    };
  }

  static updateShopEntity(updateVm: ShopUpdateVm): Partial<Shop> {
    const entity: Partial<Shop> = {};
    
    Object.keys(updateVm).forEach(key => {
      const value = updateVm[key as keyof ShopUpdateVm];
      if (value !== undefined) {
        entity[key as keyof Shop] = value as any;
      }
    });
    
    return entity;
  }
}
