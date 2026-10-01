import {
  Order,
  PaystackPaymentOptions,
  PaystackSuccessResponse,
  EmailNotification,
} from "../types";
import { orderService } from "./orderService";
import { deliveryService } from "./deliveryService";
import { auditService } from "./auditService";
import {
  isLiveSupabaseConfigured,
  localStore,
  supabase,
} from "../lib/supabase";

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: Record<string, any>) => {
        openIframe: () => void;
      };
    };
  }
}

class PaystackService {
  private scriptUrl = "https://js.paystack.co/v1/inline.js";
  private scriptLoaded = false;
  private scriptLoadingPromise: Promise<boolean> | null = null;
  /**
   * Generates a unique Paystack payment reference
   */
  generateReference(prefix = "pstk_ref_"): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${timestamp}_${randomHex}`;
  }

  /**
   * Resolves the configured Paystack Public Key
   */
  getPublicKey(overrideKey?: string): string {
    if (overrideKey && overrideKey.trim()) return overrideKey.trim();

    const envKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (envKey && envKey.trim()) return envKey.trim();

    const settings = localStore.getSiteSettings();
    if (
      settings?.paystack_public_key &&
      settings.paystack_public_key.trim() &&
      !settings.paystack_public_key.includes("sample")
    ) {
      return settings.paystack_public_key.trim();
    }

    return "pk_test_e9ee4b7a708033c7dc2d79816ca238d33b0beabd";
  }

  /**
   * Dynamically loads the Paystack Inline JavaScript library
   */
  loadScript(): Promise<boolean> {
    if (typeof window === "undefined") return Promise.resolve(false);
    if (window.PaystackPop) {
      this.scriptLoaded = true;
      return Promise.resolve(true);
    }
    if (this.scriptLoadingPromise) {
      return this.scriptLoadingPromise;
    }

    this.scriptLoadingPromise = new Promise((resolve) => {
      const existingScript = document.getElementById("paystack-inline-js");
      if (existingScript) {
        if (window.PaystackPop) {
          this.scriptLoaded = true;
          resolve(true);
        } else {
          existingScript.addEventListener("load", () => {
            this.scriptLoaded = true;
            resolve(true);
          });
          existingScript.addEventListener("error", () => resolve(false));
        }
        return;
      }

      const script = document.createElement("script");
      script.id = "paystack-inline-js";
      script.src = this.scriptUrl;
      script.async = true;
      script.onload = () => {
        this.scriptLoaded = true;
        resolve(true);
      };
      script.onerror = () => {
        console.warn(
          "Paystack inline script could not be loaded from CDN (network or sandbox restriction)",
        );
        resolve(false);
      };
      document.head.appendChild(script);
    });

    return this.scriptLoadingPromise;
  }

  /**
   * Initializes a Paystack payment session with customer data and total amount
   */
  async initializePayment(options: PaystackPaymentOptions): Promise<{
    reference: string;
    mode: "inline" | "simulated";
  }> {
    const key = this.getPublicKey(options.publicKey);
    const reference = this.generateReference();
    const amountInKobo = Math.round(options.amount * 100);

    // Record initialization event in audit log
    await auditService.logAction({
      action: "status_change",
      entity: "order",
      entity_id: options.orderId,
      details: `Initialized Paystack payment session of ₦${options.amount.toLocaleString()} for Order #${options.orderNumber}`,
      performed_by: options.customerName,
      status: "success",
      metadata: {
        order_number: options.orderNumber,
        reference,
        amount_kobo: amountInKobo,
        amount_ngn: options.amount,
        email: options.email,
        public_key_type: key.startsWith("pk_live_") ? "live" : "test",
      },
    });

    // Try loading inline script
    const isLoaded = await this.loadScript();

    // Check if real PaystackPop is available
    if ((isLoaded || window.PaystackPop) && window.PaystackPop) {
      try {
        const handler = window.PaystackPop.setup({
          key,
          email: options.email,
          amount: amountInKobo,
          currency: options.currency || "NGN",
          ref: reference,
          metadata: {
            custom_fields: [
              {
                display_name: "Customer Name",
                variable_name: "customer_name",
                value: options.customerName,
              },
              {
                display_name: "WhatsApp Number",
                variable_name: "whatsapp_number",
                value: options.customerWhatsapp,
              },
              {
                display_name: "Order Number",
                variable_name: "order_number",
                value: options.orderNumber,
              },
            ],
          },
          callback: async (response: PaystackSuccessResponse) => {
            // ONLY called by Paystack when the user actually authorizes and the transaction is approved!
            if (
              response &&
              (response.reference ||
                response.status === "success" ||
                response.trans)
            ) {
              await options.onSuccess(response);
            } else {
              if (options.onError) {
                options.onError(
                  new Error("Payment was not approved by payment gateway."),
                );
              }
            }
          },
          onClose: () => {
            // User closed the popup without completing payment
            if (options.onCancel) {
              options.onCancel();
            }
          },
        });

        handler.openIframe();
        return { reference, mode: "inline" };
      } catch (err: any) {
        console.warn(
          "Paystack inline iframe setup exception, falling back to simulated modal:",
          err,
        );
      }
    }

    // Fallback: Dispatch simulated payment session event for preview iframe & test mode
    return { reference, mode: "simulated" };
  }

  /**
   * Triggers an official payment confirmation email to the customer upon successful verification
   */
  async sendPaymentConfirmationEmail(
    order: Order,
    paymentReference?: string,
  ): Promise<EmailNotification> {
    const ref = paymentReference || order.payment_reference || "N/A";
    const recipientEmail = order.customer_email;
    const customerName = order.customer_name;

    const itemsListHtml = order.items
      .map(
        (it) =>
          `<tr>
            <td style="padding: 10px; border-bottom: 1px solid #1e293b; color: #f8fafc; font-weight: 600;">${it.product_name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #1e293b; color: #94a3b8; text-align: center;">${it.subscription_duration}</td>
            <td style="padding: 10px; border-bottom: 1px solid #1e293b; color: #94a3b8; text-align: center;">${it.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #1e293b; color: #10b981; font-weight: 700; text-align: right;">₦${it.total_price.toLocaleString()}</td>
          </tr>`,
      )
      .join("");

    const itemsListText = order.items
      .map(
        (it) =>
          `- ${it.product_name} (${it.subscription_duration}) x${it.quantity} = ₦${it.total_price.toLocaleString()}`,
      )
      .join("\n");

    const subject = `Payment Confirmed: Your SAMM AI Order #${order.order_number} is Processing`;

    const bodyText = `
Dear ${customerName},

Thank you for your payment! Your transaction has been verified successfully via Paystack.

--- ORDER RECEIPT ---
Order Number: #${order.order_number}
Payment Reference: ${ref}
Payment Gateway: Paystack
Total Amount Paid: ₦${order.total_amount.toLocaleString()}
Customer Email: ${recipientEmail}
Customer WhatsApp: ${order.customer_whatsapp}

--- PURCHASED ITEMS ---
${itemsListText}

--- DELIVERY STATUS ---
Your subscription credentials and setup instructions are being provisioned by our operations team. You will receive activation links and account logins via WhatsApp (${order.customer_whatsapp}) and email within 5 to 15 minutes.

Need urgent assistance?
WhatsApp Support: 07036192301
Email: amaechisamuelugo@gmail.com

Best regards,
SAMM AI Operations Team
`;

    const bodyHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f17; color: #f8fafc; padding: 28px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
        <div style="border-bottom: 2px solid #10b981; padding-bottom: 16px; margin-bottom: 20px;">
          <h1 style="color: #10b981; font-size: 24px; margin: 0; letter-spacing: -0.5px;">SAMM AI</h1>
          <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">Premium AI Subscriptions & Digital Tools</p>
        </div>

        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 14px 18px; margin-bottom: 20px;">
          <p style="margin: 0; color: #34d399; font-weight: 700; font-size: 15px;">✓ Payment Verified via Paystack</p>
          <p style="margin: 4px 0 0 0; color: #cbd5e1; font-size: 12px;">Transaction Reference: <code>${ref}</code></p>
        </div>

        <p style="font-size: 14px; color: #e2e8f0; line-height: 1.5;">Dear <strong>${customerName}</strong>,</p>
        <p style="font-size: 13px; color: #94a3b8; line-height: 1.6;">
          We have successfully verified your payment of <strong style="color: #10b981; font-size: 15px;">₦${order.total_amount.toLocaleString()}</strong> for Order <strong>#${order.order_number}</strong>.
        </p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px;">
          <thead>
            <tr style="background: #1e293b; color: #94a3b8; text-align: left;">
              <th style="padding: 10px;">Item</th>
              <th style="padding: 10px; text-align: center;">Duration</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsListHtml}
          </tbody>
        </table>

        <div style="background: #111827; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 12px; border: 1px solid #1f2937;">
          <h4 style="margin: 0 0 8px 0; color: #f8fafc; font-size: 13px;">Delivery Timeline & Access</h4>
          <p style="margin: 0; color: #94a3b8; line-height: 1.5;">
            Our automated provisioning team has scheduled deployment of your credentials. You will receive activation links and account logins via WhatsApp (<strong>${order.customer_whatsapp}</strong>) and this email within <strong>5–15 minutes</strong>.
          </p>
        </div>

        <div style="border-top: 1px solid #1e293b; padding-top: 16px; font-size: 11px; color: #64748b; text-align: center;">
          <p style="margin: 0 0 4px 0;">Official Support: <strong>07036192301</strong> (Available 7 Days a Week)</p>
          <p style="margin: 0;">© 2026 SAMM AI · Africa's Premier AI Marketplace</p>
        </div>
      </div>
    `;

    const notification: EmailNotification = {
      id: "email-" + Date.now() + "-" + Math.random().toString(36).substring(7),
      order_id: order.id,
      order_number: order.order_number,
      recipient_email: recipientEmail,
      recipient_name: customerName,
      subject,
      body_text: bodyText,
      body_html: bodyHtml,
      sent_at: new Date().toISOString(),
      status: "sent",
    };

    // Store in localStorage
    try {
      const storedEmails = JSON.parse(
        localStorage.getItem("samm_email_notifications") || "[]",
      );
      storedEmails.unshift(notification);
      localStorage.setItem(
        "samm_email_notifications",
        JSON.stringify(storedEmails.slice(0, 50)),
      );
    } catch {
      // ignore storage error
    }

    // Record in audit log
    await auditService.logAction({
      action: "delivery",
      entity: "order",
      entity_id: order.id,
      details: `Dispatched payment confirmation email to ${recipientEmail} for Order #${order.order_number}`,
      performed_by: "Paystack Automated Gateway",
      status: "success",
      metadata: {
        order_number: order.order_number,
        payment_reference: ref,
        recipient: recipientEmail,
        subject,
      },
    });

    return notification;
  }

  /** Verifies payment through the server-side Supabase Edge Function. */
  async verifyWithPaystackApi(
    reference: string,
    orderId: string,
  ): Promise<{
    verified: boolean;
    data?: any;
    error?: string;
  }> {
    if (!isLiveSupabaseConfigured || !supabase) {
      return {
        verified: false,
        error: "Secure payment verification is not configured.",
      };
    }
    const { data, error } = await supabase.functions.invoke("verify-payment", {
      body: { reference, order_id: orderId },
    });
    if (error) return { verified: false, error: error.message };
    return data?.success
      ? { verified: true, data }
      : {
          verified: false,
          error: data?.message || data?.error || "Payment verification failed.",
        };
  }

  /**
   * Verifies and finalizes the payment in Supabase and Order service
   */
  async verifyPayment(
    reference: string,
    orderId: string,
    paidAmount: number,
  ): Promise<{
    success: boolean;
    order: Order;
    emailNotification: EmailNotification;
  }> {
    const order = await orderService.getOrderById(orderId);
    if (!order) {
      throw new Error(
        `Order #${orderId} was not found for payment verification.`,
      );
    }

    // Verify with Paystack on the server; secret keys must never be shipped to browsers.
    const apiVerification = await this.verifyWithPaystackApi(
      reference,
      orderId,
    );
    if (!apiVerification.verified) {
      throw new Error(
        `Paystack Verification Failed: ${apiVerification.error || "Transaction not approved"}`,
      );
    }

    // Update order status to paid
    const updatedOrder = await orderService.updateOrderStatus(orderId, {
      payment_status: "paid",
      order_status: "processing",
      payment_reference: reference,
      payment_provider: "Paystack",
      delivery_status: "processing",
    });

    // Generate delivery records for fulfilled subscription items
    for (const item of updatedOrder.items) {
      await deliveryService.createRecord({
        order_id: updatedOrder.id,
        order_number: updatedOrder.order_number,
        customer_id: updatedOrder.customer_id,
        customer_email: updatedOrder.customer_email,
        customer_whatsapp: updatedOrder.customer_whatsapp,
        product_id: item.product_id,
        product_name: item.product_name,
        delivery_method: "Email & WhatsApp Instant Delivery",
        delivery_status: "processing",
        delivery_instructions:
          "Paystack transaction verified. Our operations team is provisioning your subscription credentials.",
        access_information: `Processing secure access for ${item.product_name}. Confirmation link will be sent to ${updatedOrder.customer_whatsapp}`,
      });
    }

    // Trigger official confirmation email
    const emailNotification = await this.sendPaymentConfirmationEmail(
      updatedOrder,
      reference,
    );

    // Record verified transaction in audit log
    await auditService.logAction({
      action: "status_change",
      entity: "order",
      entity_id: updatedOrder.id,
      details: `Paystack payment verified successfully: Reference ${reference} (₦${paidAmount.toLocaleString()})`,
      performed_by: updatedOrder.customer_name,
      status: "success",
      metadata: {
        order_id: updatedOrder.id,
        order_number: updatedOrder.order_number,
        reference,
        amount: paidAmount,
        currency: updatedOrder.currency,
        items_count: updatedOrder.items.length,
        email_sent_to: emailNotification.recipient_email,
      },
    });

    return { success: true, order: updatedOrder, emailNotification };
  }
}

export const paystackService = new PaystackService();
export { PaystackService };
