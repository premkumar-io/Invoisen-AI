import { apiCall } from "./api";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface RazorpayOptions {
  amount: number; // in INR or target currency
  currency?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  plan?: "pro" | "enterprise" | "business";
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

export async function processRazorpayPayment(options: RazorpayOptions): Promise<boolean> {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    options.onError?.("Razorpay SDK failed to load. Please check your internet connection.");
    return false;
  }

  // 1. Create order on backend
  const orderRes = await apiCall<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
  }>("POST", "/payments/razorpay/create-order", {
    amount: options.amount,
    currency: options.currency || "INR",
    invoiceId: options.invoiceId,
    invoiceNumber: options.invoiceNumber,
    plan: options.plan,
  });

  if (!orderRes.success || !orderRes.data?.orderId) {
    const errorMsg =
      !orderRes.success && orderRes.error?.message
        ? orderRes.error.message
        : "Failed to initialize payment order.";
    options.onError?.(errorMsg);
    return false;
  }

  const { orderId, currency, keyId } = orderRes.data;
  const razorpayKey = keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_TN2kYzf5w2mmPG";

  return new Promise((resolve) => {
    const checkoutOptions = {
      key: razorpayKey,
      amount: orderRes.data.amount,
      currency: currency || "INR",
      name: "Invoisen AI",
      description: options.description || `Payment for ${options.invoiceNumber || "Invoisen Workspace"}`,
      order_id: orderId,
      prefill: {
        name: options.prefill?.name || "",
        email: options.prefill?.email || "",
        contact: options.prefill?.contact || "",
      },
      theme: {
        color: "#2563EB",
      },
      handler: async function (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) {
        // 2. Verify payment signature on backend
        const verifyRes = await apiCall<{ verified: boolean }>("POST", "/payments/razorpay/verify", {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          invoiceId: options.invoiceId,
          invoiceNumber: options.invoiceNumber,
          amount: options.amount,
          currency: options.currency || "INR",
          plan: options.plan,
        });

        if (verifyRes.success) {
          options.onSuccess?.(response.razorpay_payment_id);
          resolve(true);
        } else {
          const verifyErr =
            !verifyRes.success && verifyRes.error?.message
              ? verifyRes.error.message
              : "Payment signature verification failed.";
          options.onError?.(verifyErr);
          resolve(false);
        }
      },
      modal: {
        ondismiss: function () {
          options.onError?.("Payment cancelled by user.");
          resolve(false);
        },
      },
    };

    const rzp = new (window as any).Razorpay(checkoutOptions);
    rzp.open();
  });
}
