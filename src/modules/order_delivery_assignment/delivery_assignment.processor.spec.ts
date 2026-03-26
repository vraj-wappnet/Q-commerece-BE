import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryProcessor } from './delivery_assignment.processor';
import { Job } from 'bullmq';
import { DeliveryAssignment } from './entity/delivery_assignment.entity';
import { AssignmentStatus } from 'src/common/enum/status.enum';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('DeliveryProcessor', () => {
  let processor: DeliveryProcessor;
  let deliveryAssignmentRepo: Repository<DeliveryAssignment>;

  const mockDeliveryAssignmentRepo = {
    findOne: vi.fn(),
    save: vi.fn(),
  };

  const mockDeliveryAssignment: DeliveryAssignment = {
    id: '1',
    order: { id: 'order123' },
    user: { id: 'delivery123' },
    status: AssignmentStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  const mockJob: Job<{ orderId: string; deliveryId: string }> = {
    data: {
      orderId: 'order123',
      deliveryId: 'delivery123',
    },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryProcessor,
        {
          provide: getRepositoryToken(DeliveryAssignment),
          useValue: mockDeliveryAssignmentRepo,
        },
      ],
    }).compile();

    processor = module.get<DeliveryProcessor>(DeliveryProcessor);
    deliveryAssignmentRepo = module.get<Repository<DeliveryAssignment>>(getRepositoryToken(DeliveryAssignment));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('process', () => {
    it('should process delivery assignment job successfully', async () => {
      mockDeliveryAssignmentRepo.findOne.mockResolvedValue(mockDeliveryAssignment);
      mockDeliveryAssignmentRepo.save.mockResolvedValue({
        ...mockDeliveryAssignment,
        status: AssignmentStatus.EXPIRED,
      });

      await processor.process(mockJob);

      expect(deliveryAssignmentRepo.findOne).toHaveBeenCalledWith({
        where: {
          order: { id: 'order123' },
          user: { id: 'delivery123' },
          status: AssignmentStatus.PENDING,
        }
      });
      expect(deliveryAssignmentRepo.save).toHaveBeenCalledWith({
        ...mockDeliveryAssignment,
        status: AssignmentStatus.EXPIRED,
      });
    });

    it('should return early if assignment not found', async () => {
      mockDeliveryAssignmentRepo.findOne.mockResolvedValue(null);

      await processor.process(mockJob);

      expect(deliveryAssignmentRepo.findOne).toHaveBeenCalledWith({
        where: {
          order: { id: 'order123' },
          user: { id: 'delivery123' },
          status: AssignmentStatus.PENDING,
        }
      });
      expect(deliveryAssignmentRepo.save).not.toHaveBeenCalled();
    });

    it('should handle job data correctly', async () => {
      const jobWithData: Job<{ orderId: string; deliveryId: string }> = {
        data: {
          orderId: 'test-order-456',
          deliveryId: 'test-delivery-789',
        },
      } as any;

      mockDeliveryAssignmentRepo.findOne.mockResolvedValue(mockDeliveryAssignment);
      mockDeliveryAssignmentRepo.save.mockResolvedValue(mockDeliveryAssignment);

      await processor.process(jobWithData);

      expect(deliveryAssignmentRepo.findOne).toHaveBeenCalledWith({
        where: {
          order: { id: 'test-order-456' },
          user: { id: 'test-delivery-789' },
          status: AssignmentStatus.PENDING,
        }
      });
    });
  });
});
