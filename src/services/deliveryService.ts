import { DeliveryRecord } from '../types';
import { supabase, isLiveSupabaseConfigured, localStore } from '../lib/supabase';

export const deliveryService = {
  async getDeliveryRecords(customerId?: string): Promise<DeliveryRecord[]> {
    if (isLiveSupabaseConfigured && supabase) {
      let query = supabase
        .from('delivery_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (customerId) {
        query = query.eq('customer_id', customerId);
      }

      const { data, error } = await query;
      if (!error && data) return data;
    }

    const records = localStore.getDeliveryRecords();
    if (customerId) {
      return records.filter((r) => r.customer_id === customerId || r.customer_email === customerId);
    }
    return records;
  },

  async fulfillRecord(
    recordId: string,
    accessInfo: string,
    instructions: string,
    fulfilledBy = 'SAMM AI Operations Team'
  ): Promise<DeliveryRecord> {
    const records = localStore.getDeliveryRecords();
    const index = records.findIndex((r) => r.id === recordId);
    if (index === -1) throw new Error('Delivery record not found');

    const updated: DeliveryRecord = {
      ...records[index],
      delivery_status: 'delivered',
      access_information: accessInfo,
      delivery_instructions: instructions,
      fulfilled_by: fulfilledBy,
      fulfilled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      subscription_start: new Date().toISOString(),
    };

    records[index] = updated;
    localStore.setDeliveryRecords([...records]);

    // Also update order status
    const orders = localStore.getOrders();
    const orderIndex = orders.findIndex((o) => o.id === updated.order_id || o.order_number === updated.order_number);
    if (orderIndex !== -1) {
      orders[orderIndex] = {
        ...orders[orderIndex],
        order_status: 'fulfilled',
        delivery_status: 'delivered',
        updated_at: new Date().toISOString(),
      };
      localStore.setOrders([...orders]);
    }

    return updated;
  },

  async createRecord(record: Omit<DeliveryRecord, 'id' | 'created_at' | 'updated_at'>): Promise<DeliveryRecord> {
    const newRecord: DeliveryRecord = {
      ...record,
      id: 'del-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const current = localStore.getDeliveryRecords();
    localStore.setDeliveryRecords([newRecord, ...current]);
    return newRecord;
  },
};
