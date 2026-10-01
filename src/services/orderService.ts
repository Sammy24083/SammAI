import { Order, OrderItem, DeliveryRecord } from '../types';
import { supabase, isLiveSupabaseConfigured, localStore } from '../lib/supabase';

// Helper to safely pack metadata into order_notes
function packOrderNotes(notes?: string, receiptUrl?: string, senderName?: string): string {
  return JSON.stringify({
    notes: notes || '',
    receipt_url: receiptUrl || null,
    sender_name: senderName || null,
  });
}

function getLocalOrderOverrides(): Record<string, Partial<Order>> {
  try {
    const saved = localStorage.getItem('samm_order_overrides');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveLocalOrderOverride(orderIdOrNumber: string, updates: Partial<Order>) {
  try {
    const existing = getLocalOrderOverrides();
    existing[orderIdOrNumber] = {
      ...(existing[orderIdOrNumber] || {}),
      ...updates,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem('samm_order_overrides', JSON.stringify(existing));
  } catch {}
}

function applyOrderOverrides(order: Order): Order {
  const overrides = getLocalOrderOverrides();
  const override = overrides[order.order_number] || overrides[order.id] || {};
  return {
    ...order,
    ...override,
    order_status: override.order_status || order.order_status,
    payment_status: override.payment_status || order.payment_status,
    delivery_status: override.delivery_status || order.delivery_status,
  };
}

// Helper to unpack receipt_url, sender_name, and clean notes
function unpackOrderNotes(rawNotes?: string): { notes: string; receipt_url?: string; sender_name?: string } {
  if (!rawNotes) return { notes: '', receipt_url: undefined, sender_name: undefined };
  try {
    if (rawNotes.startsWith('{') && rawNotes.endsWith('}')) {
      const parsed = JSON.parse(rawNotes);
      return {
        notes: parsed.notes || '',
        receipt_url: parsed.receipt_url || undefined,
        sender_name: parsed.sender_name || undefined,
      };
    }
  } catch {}

  // Fallback regex if notes was saved as plain text with tags
  const receiptMatch = rawNotes.match(/\[Receipt:\s*([^\]]+)\]/);
  const senderMatch = rawNotes.match(/OPay Sender:\s*([^|\[]+)/);
  return {
    notes: rawNotes.replace(/\[Receipt:[^\]]+\]/g, '').trim(),
    receipt_url: receiptMatch ? receiptMatch[1].trim() : undefined,
    sender_name: senderMatch ? senderMatch[1].trim() : undefined,
  };
}

export const orderService = {
  async getOrders(customerId?: string): Promise<Order[]> {
    let dbOrders: Order[] = [];

    if (isLiveSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false });

        if (customerId) {
          query = query.eq('customer_id', customerId);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          dbOrders = data.map((item: any) => {
            const unpacked = unpackOrderNotes(item.order_notes);
            return {
              ...item,
              receipt_url: unpacked.receipt_url || item.receipt_url,
              sender_name: unpacked.sender_name || item.sender_name,
              order_notes: unpacked.notes || item.order_notes,
              items: item.order_items || [],
            };
          });
        }
      } catch (err) {
        console.warn('Supabase getOrders query error, falling back to local:', err);
      }
    }

    // Merge Supabase orders with localStore orders to guarantee 100% real-time reflection
    const localOrders = localStore.getOrders();
    const orderMap = new Map<string, Order>();

    // Start with local store orders
    localOrders.forEach((o) => {
      orderMap.set(o.order_number, applyOrderOverrides(o));
    });

    // Merge in Supabase orders
    dbOrders.forEach((rawDbOrder) => {
      const o = applyOrderOverrides(rawDbOrder);
      const existing = orderMap.get(o.order_number);
      if (existing) {
        // Respect the most recent status and local overrides
        const existingTime = new Date(existing.updated_at || existing.created_at || 0).getTime();
        const dbTime = new Date(o.updated_at || o.created_at || 0).getTime();
        if (existingTime >= dbTime) {
          orderMap.set(o.order_number, {
            ...o,
            ...existing,
            items: existing.items && existing.items.length > 0 ? existing.items : (o.items || []),
          });
        } else {
          orderMap.set(o.order_number, {
            ...existing,
            ...o,
            receipt_url: o.receipt_url || existing.receipt_url,
            sender_name: o.sender_name || existing.sender_name,
            items: o.items && o.items.length > 0 ? o.items : existing.items,
          });
        }
      } else {
        orderMap.set(o.order_number, o);
      }
    });

    const merged = Array.from(orderMap.values()).map(applyOrderOverrides).sort(
      (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    );

    if (customerId) {
      return merged.filter(
        (o) => o.customer_id === customerId || o.customer_email === customerId
      );
    }
    return merged;
  },

  async getOrderById(id: string): Promise<Order | null> {
    const orders = await this.getOrders();
    return orders.find((o) => o.id === id || o.order_number === id) || null;
  },

  async createOrder(
    orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>
  ): Promise<Order> {
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `SAMM-2026-${randomSeq}`;
    const newOrderId = 'ord-' + Date.now();

    const newOrder: Order = {
      ...orderData,
      id: newOrderId,
      order_number: orderNumber,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Pack receipt_url and sender_name into order_notes JSON so Supabase doesn't error on missing columns
    const packedNotes = packOrderNotes(newOrder.order_notes, newOrder.receipt_url, newOrder.sender_name);

    // If live Supabase configured, post to Supabase
    if (isLiveSupabaseConfigured && supabase) {
      try {
        const { data: dbOrder, error: orderErr } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            customer_id: newOrder.customer_id || null,
            customer_name: newOrder.customer_name || 'Customer',
            customer_email: newOrder.customer_email || 'customer@example.com',
            customer_phone: newOrder.customer_phone || '07036192301',
            customer_whatsapp: newOrder.customer_whatsapp || newOrder.customer_phone || '07036192301',
            customer_country: newOrder.customer_country || 'Nigeria',
            order_notes: packedNotes,
            subtotal: newOrder.subtotal,
            discount_amount: newOrder.discount_amount || 0,
            total_amount: newOrder.total_amount,
            currency: newOrder.currency || 'NGN',
            discount_code: newOrder.discount_code || null,
            payment_status: newOrder.payment_status,
            order_status: newOrder.order_status,
            payment_provider: newOrder.payment_provider,
            delivery_status: newOrder.delivery_status,
          })
          .select()
          .single();

        if (orderErr) {
          console.warn('Supabase order insert error:', orderErr);
        } else if (dbOrder && newOrder.items?.length) {
          await supabase.from('order_items').insert(
            newOrder.items.map((it) => ({
              order_id: dbOrder.id,
              product_id: it.product_id,
              product_name: it.product_name,
              quantity: it.quantity,
              unit_price: it.unit_price,
              total_price: it.total_price,
              subscription_duration: it.subscription_duration,
              image_url: it.image_url,
            }))
          );
        }
      } catch (err) {
        console.warn('Supabase post order failed:', err);
      }
    }

    // Always update local store so it is available instantly across the frontend
    const currentOrders = localStore.getOrders();
    localStore.setOrders([newOrder, ...currentOrders]);

    // Dispatch real-time reactive event so Admin and UI update immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('samm-store-update', {
          detail: { entity: 'orders', orderId: newOrder.id, orderNumber: newOrder.order_number },
        })
      );
      try {
        localStorage.setItem('samm_last_store_sync', Date.now().toString());
      } catch {}
    }

    return newOrder;
  },

  async updateOrderStatus(
    orderId: string,
    updates: Partial<Pick<Order, 'order_status' | 'payment_status' | 'delivery_status' | 'payment_reference' | 'payment_provider' | 'receipt_url' | 'sender_name'>>
  ): Promise<Order> {
    // 1. Save persistent override by ID and by order_number
    saveLocalOrderOverride(orderId, updates);

    let orders = localStore.getOrders();
    let index = orders.findIndex((o) => o.id === orderId || o.order_number === orderId);

    // If order was only in Supabase and not yet in localStore, fetch it
    if (index === -1) {
      const all = await this.getOrders();
      const found = all.find((o) => o.id === orderId || o.order_number === orderId);
      if (found) {
        orders = [found, ...orders.filter((o) => o.order_number !== found.order_number)];
        index = 0;
      }
    }

    const baseOrder = index !== -1 ? orders[index] : ({ id: orderId, order_number: orderId } as Order);
    const updatedOrder: Order = {
      ...baseOrder,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    saveLocalOrderOverride(updatedOrder.order_number, updates);
    if (updatedOrder.id) saveLocalOrderOverride(updatedOrder.id, updates);

    if (index !== -1) {
      orders[index] = updatedOrder;
      localStore.setOrders([...orders]);
    } else {
      localStore.setOrders([updatedOrder, ...orders]);
    }

    // 2. Sync to Supabase
    if (isLiveSupabaseConfigured && supabase) {
      try {
        const { receipt_url, sender_name, ...dbUpdates } = updates as any;
        const packedNotes = packOrderNotes(
          updatedOrder.order_notes,
          updatedOrder.receipt_url,
          updatedOrder.sender_name
        );

        await supabase
          .from('orders')
          .update({
            ...dbUpdates,
            order_notes: packedNotes,
            updated_at: new Date().toISOString(),
          })
          .or(`order_number.eq.${updatedOrder.order_number},id.eq.${updatedOrder.id}`);
      } catch (err) {
        console.warn('Supabase order update fallback:', err);
      }
    }

    // 3. Dispatch real-time reactive event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('samm-store-update', {
          detail: { entity: 'orders', orderId: updatedOrder.id, orderNumber: updatedOrder.order_number, updates },
        })
      );
      try {
        localStorage.setItem('samm_last_store_sync', Date.now().toString());
      } catch {}
    }

    return applyOrderOverrides(updatedOrder);
  },

  async cancelOrder(
    orderIdOrNumber: string,
    reason = 'Cancelled by user',
    cancelledBy: 'admin' | 'customer' = 'customer'
  ): Promise<Order> {
    const updates = {
      order_status: 'cancelled' as const,
      delivery_status: 'cancelled' as const,
      payment_status: 'failed' as const,
    };

    return this.updateOrderStatus(orderIdOrNumber, updates);
  },

  async attachReceipt(orderId: string, receiptUrl: string, senderName?: string): Promise<Order> {
    return this.updateOrderStatus(orderId, {
      receipt_url: receiptUrl,
      sender_name: senderName,
      payment_status: 'pending',
      order_status: 'pending',
    });
  },
};
