// ─── NEW enums (not present in existing enum.model.ts) ────────────────────────

export enum PaymentMethod {
  UPI         = 'UPI',
  CARD        = 'CARD',
  NET_BANKING = 'NET_BANKING',
  WALLET      = 'WALLET',
}

export enum PaymentStatus {
  INITIATED  = 'INITIATED',
  PENDING    = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID       = 'PAID',
  FAILED     = 'FAILED',
  COMPLETED  = 'COMPLETED',
}

export enum TransactionStatus {
  PENDING   = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED    = 'FAILED',
}

export enum TransactionStep {
  INITIATING        = 0,
  RECORDING         = 1,
  AWAITING_GATEWAY  = 2,
  CALLBACK_RECEIVED = 3,
  FINALIZING        = 4,
  SYNCING_INVENTORY = 5,
  DONE              = 6,
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface OrderItem {
  cropName:     string;
  quantity:     number;
  unit:         string;
  pricePerUnit: number;
  subtotal:     number;
}

/** Enriched order used in checkout UI — extends existing OrderDTO from dto.model.ts */
export interface CheckoutOrder {
  orderId:           number;
  listingId:         number;
  traderId:          number;
  quantity:          number;
  orderDate:         string;
  orderStatus:       string;
  items:             OrderItem[];
  subtotal:          number;
  platformFee:       number;
  grandTotal:        number;
  deliveryAddress:   string;
  estimatedDelivery: string;
  farmerName:        string;
  cropName:          string;
}

export interface TransactionRequestDTO {
  orderId: number;
  amount:  number;
}

export interface PaymentRequestDTO {
  transactionId: number;
  method:        PaymentMethod;
}

export interface Transaction {
  transactionId:     number;
  orderId:           number;
  transactionAmount: number;
  transactionDate:   string;
  transactionStatus: TransactionStatus;
}

export interface Payment {
  paymentId:     number;
  transaction:   { transactionId: number };
  method:        PaymentMethod;
  paymentDate:   string;
  paymentStatus: PaymentStatus;
}

export interface StepState {
  step:       TransactionStep;
  label:      string;
  apiLabel:   string;
  status:     'pending' | 'active' | 'done' | 'error';
  timestamp?: string;
}
