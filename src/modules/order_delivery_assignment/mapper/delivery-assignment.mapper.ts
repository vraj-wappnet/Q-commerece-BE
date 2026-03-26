import { DeliveryAssignment } from "../entity/delivery_assignment.entity";
import { DeliveryAssignmentVm, DeliveryAssignmentSummaryVm, DeliveryAssignmentCreateVm } from "../vm/delivery-assignment.vm";

export class DeliveryAssignmentMapper {
  static toDeliveryAssignmentVm(assignment: DeliveryAssignment): DeliveryAssignmentVm {
    return {
      id: assignment.id,
      order: assignment.order ? {
        id: assignment.order.id,
        totalAmount: Number(assignment.order.totalAmount),
        status: assignment.order.status,
        createdAt: assignment.order.createdAt,
      } : undefined,
      user: assignment.user ? {
        id: assignment.user.id,
        firstName: assignment.user.firstName,
        lastName: assignment.user.lastName,
        email: assignment.user.email,
        mobile: assignment.user.mobile,
      } : undefined,
      status: assignment.status,
      createdAt: assignment.createdAt,
    };
  }

  static toDeliveryAssignmentSummaryVm(assignment: DeliveryAssignment): DeliveryAssignmentSummaryVm {
    return {
      id: assignment.id,
      orderId: assignment.order?.id || '',
      deliveryPersonName: assignment.user ? 
        `${assignment.user.firstName} ${assignment.user.lastName}` : 'Unknown',
      status: assignment.status,
      orderAmount: assignment.order ? Number(assignment.order.totalAmount) : 0,
      createdAt: assignment.createdAt,
    };
  }

  static toDeliveryAssignmentVmList(assignments: DeliveryAssignment[]): DeliveryAssignmentVm[] {
    return assignments.map(assignment => this.toDeliveryAssignmentVm(assignment));
  }

  static toDeliveryAssignmentSummaryVmList(assignments: DeliveryAssignment[]): DeliveryAssignmentSummaryVm[] {
    return assignments.map(assignment => this.toDeliveryAssignmentSummaryVm(assignment));
  }

  static toDeliveryAssignmentEntity(createVm: DeliveryAssignmentCreateVm): Partial<DeliveryAssignment> {
    return {
      order: { id: createVm.orderId } as any,
      user: { id: createVm.userId } as any,
      status: createVm.status,
    };
  }
}
