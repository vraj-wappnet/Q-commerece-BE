import { DeliveryProfile } from "../entity/delivery-profile.entity";
import { DeliveryProfileVm, DeliveryProfileSummaryVm, DeliveryProfileCreateVm } from "../vm/delivery-profile.vm";

export class DeliveryProfileMapper {
  static toDeliveryProfileVm(profile: DeliveryProfile): DeliveryProfileVm {
    return {
      id: profile.id,
      user: profile.user ? {
        id: profile.user.id,
        firstName: profile.user.firstName,
        lastName: profile.user.lastName,
        email: profile.user.email,
        mobile: profile.user.mobile,
      } : undefined,
      vehicle: {
        type: profile.vehicleType,
        name: profile.vehicleName,
        rcBookPhoto: profile.rcBookPhoto,
        licensePhoto: profile.licensePhoto,
      },
      address: {
        addressLine1: profile.addressLine1,
        addressLine2: profile.addressLine2,
        city: profile.city,
        state: profile.state,
        pincode: profile.pincode,
      },
      location: {
        latitude: Number(profile.latitude),
        longitude: Number(profile.longitude),
        location: profile.location,
      },
      isAvailable: profile.isAvailable,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  static toDeliveryProfileSummaryVm(profile: DeliveryProfile): DeliveryProfileSummaryVm {
    return {
      id: profile.id,
      fullName: profile.user ? `${profile.user.firstName} ${profile.user.lastName}` : 'Unknown',
      vehicleType: profile.vehicleType,
      isAvailable: profile.isAvailable,
      mobile: profile.user?.mobile || '',
    };
  }

  static toDeliveryProfileVmList(profiles: DeliveryProfile[]): DeliveryProfileVm[] {
    return profiles.map(profile => this.toDeliveryProfileVm(profile));
  }

  static toDeliveryProfileSummaryVmList(profiles: DeliveryProfile[]): DeliveryProfileSummaryVm[] {
    return profiles.map(profile => this.toDeliveryProfileSummaryVm(profile));
  }

  static toDeliveryProfileEntity(createVm: DeliveryProfileCreateVm): Partial<DeliveryProfile> {
    return {
      vehicleType: createVm.vehicleType,
      vehicleName: createVm.vehicleName,
      rcBookPhoto: createVm.rcBookPhoto,
      licensePhoto: createVm.licensePhoto,
      addressLine1: createVm.addressLine1,
      addressLine2: createVm.addressLine2,
      city: createVm.city,
      state: createVm.state,
      pincode: createVm.pincode,
      location: createVm.location,
      latitude: createVm.latitude,
      longitude: createVm.longitude,
    };
  }
}
