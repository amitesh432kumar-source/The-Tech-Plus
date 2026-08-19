export interface PaypalOrderActions {
  order: {
    create: (options: {
      purchase_units: Array<{ reference_id?: string; amount: { value: string; currency_code: string } }>;
    }) => Promise<string>;
    capture: () => Promise<unknown>;
  };
}

export interface PaypalButtonsOptions {
  style?: { layout?: "vertical" | "horizontal"; color?: string; shape?: string; label?: string };
  createOrder: (data: unknown, actions: PaypalOrderActions) => Promise<string>;
  onApprove: (data: { orderID: string }, actions: PaypalOrderActions) => Promise<void>;
  onError?: (err: unknown) => void;
  onCancel?: () => void;
}

interface PaypalButtonsInstance {
  render: (selector: string | HTMLElement) => Promise<void>;
  close: () => Promise<void>;
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: PaypalButtonsOptions) => PaypalButtonsInstance;
    };
  }
}

const scriptPromises = new Map<string, Promise<void>>();

export function loadPaypalScript(clientId: string, currency: string): Promise<void> {
  if (typeof window !== "undefined" && window.paypal) return Promise.resolve();

  const cacheKey = `${clientId}:${currency}`;
  const cached = scriptPromises.get(cacheKey);
  if (cached) return cached;

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}&intent=capture`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load PayPal checkout"));
    document.body.appendChild(script);
  });

  scriptPromises.set(cacheKey, promise);
  return promise;
}
