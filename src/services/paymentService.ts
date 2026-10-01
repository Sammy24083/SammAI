import { Order, Payment } from '../types';
import { paystackService } from './paystackService';

export const paymentService = {
  // Initiates payment verification workflow
  async verifyAndFinalizePayment(
    orderId: string,
    reference: string,
    paidAmount: number
  ): Promise<{ success: boolean; order: Order; emailNotification?: any }> {
    return paystackService.verifyPayment(reference, orderId, paidAmount);
  },
};

export { paystackService };
