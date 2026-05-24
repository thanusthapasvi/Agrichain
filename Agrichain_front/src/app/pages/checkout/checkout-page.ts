import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { CheckoutComponent }           from './checkout';
import { PaymentMethodComponent }      from './payment-method';
import { TransactionStepperComponent } from './transaction-stepper';
import { ResolutionComponent }         from './resolution';

import { TransactionStateService }  from '../../services/transaction-state.service';
import { TransactionService }       from '../../services/transaction.service';
import { PaymentService }           from '../../services/payment.service';
import { ToastService }             from '../../services/toast-service';

import {
  CheckoutOrder,
  PaymentMethod,
  PaymentStatus,
  TransactionStep,
  OrderItem,
} from '../../models/transaction.model';

type ViewState = 'checkout' | 'stepper' | 'resolution';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    CommonModule,
    CheckoutComponent,
    PaymentMethodComponent,
    TransactionStepperComponent,
    ResolutionComponent,
  ],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.css',
})
export class CheckoutPageComponent implements OnInit, OnDestroy {
  protected txState   = inject(TransactionStateService);
  private txService   = inject(TransactionService);
  private payService  = inject(PaymentService);
  private toast       = inject(ToastService);
  private route       = inject(ActivatedRoute);
  protected router    = inject(Router);

  view              = signal<ViewState>('checkout');
  order             = signal<CheckoutOrder | null>(null);
  showPaymentSheet  = signal(false);
  pendingGrandTotal = signal(0);

  ngOnInit(): void {
    const orderId = +(this.route.snapshot.paramMap.get('orderId') ?? 0);
    // Try to read state passed from the crop listing page
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state ?? history.state;

    if (state?.order && state?.listing) {
      const apiOrder = state.order;
      const listing  = state.listing;
      const qty      = state.quantity ?? apiOrder.quantity ?? 1;
      const price    = listing.price ?? 0;
      const subtotal = +(price * qty).toFixed(2);
      const platformFee = +(subtotal * 0.02).toFixed(2);

      const items: OrderItem[] = [{
        cropName:     listing.cropType ?? 'Crop',
        quantity:     qty,
        unit:         'kg',
        pricePerUnit: price,
        subtotal,
      }];

      this.order.set({
        orderId:           apiOrder.orderId ?? orderId,
        listingId:         listing.listingId,
        traderId:          apiOrder.traderId,
        quantity:          qty,
        orderDate:         apiOrder.orderDate ?? new Date().toISOString().split('T')[0],
        orderStatus:       apiOrder.orderStatus ?? 'CONFIRMED',
        items,
        subtotal,
        platformFee,
        grandTotal:        +(subtotal + platformFee).toFixed(2),
        deliveryAddress:   listing.location ?? 'AgriChain Market Hub',
        estimatedDelivery: '3–5 business days',
        farmerName:        `Farmer #${listing.farmerId}`,
        cropName:          listing.cropType ?? 'Crop',
      });
    } else {
      // Fallback: mock order (when navigating directly without state)
      this.order.set(this.buildMockOrder(orderId || 1));
    }
  }

  // ── Step A: Open payment sheet ──────────────────────────────────────────
  onProceedToPay(event: { grandTotal: number }): void {
    this.pendingGrandTotal.set(event.grandTotal);
    this.showPaymentSheet.set(true);
  }

  // ── Step B: Payment method confirmed → start flow ───────────────────────
  async onPaymentConfirmed(method: PaymentMethod): Promise<void> {
    this.showPaymentSheet.set(false);
    this.txState.reset();
    this.view.set('stepper');
    await this.runTransactionFlow(method);
  }

  // ── The 7-step transaction lifecycle ────────────────────────────────────
  private async runTransactionFlow(method: PaymentMethod): Promise<void> {
    const order = this.order();
    if (!order) return;

    // Map frontend PaymentMethod to backend PaymentType enum
    const backendMethod = this.mapPaymentMethod(method);

    // ── 1. Initiate Transaction ──
    this.txState.activateStep(TransactionStep.INITIATING);
    await this.sleep(700);

    let transactionId: number;
    try {
      const tx = await this.txService
        .createTransaction({ orderId: order.orderId, amount: this.pendingGrandTotal() })
        .toPromise();
      transactionId = tx!.transactionId;
      this.txState.setTransaction(tx!);
      this.txState.markStepDone(TransactionStep.INITIATING);
    } catch {
      this.txState.markStepError(TransactionStep.INITIATING);
      this.resolveFlow('payment_failed', 'Failed to initiate transaction');
      return;
    }

    // ── 2. Record Payment ──
    this.txState.activateStep(TransactionStep.RECORDING);
    await this.sleep(900);

    let paymentId: number;
    try {
      const payment = await this.payService
        .recordPayment({ transactionId, method: backendMethod as any })
        .toPromise();
      paymentId = payment!.paymentId;
      this.txState.setPayment(payment!);
      this.txState.markStepDone(TransactionStep.RECORDING);
    } catch {
      this.txState.markStepError(TransactionStep.RECORDING);
      this.resolveFlow('payment_failed', 'Payment recording failed. No charge made.');
      return;
    }

    // ── 3. Await Gateway (3s simulated poll) ──
    this.txState.activateStep(TransactionStep.AWAITING_GATEWAY);
    await this.sleep(3000);
    this.txState.markStepDone(TransactionStep.AWAITING_GATEWAY);

    // ── 4. Gateway Callback ──
    this.txState.activateStep(TransactionStep.CALLBACK_RECEIVED);
    await this.sleep(800);

    try {
      const confirmed = await this.payService
        .confirmPayment(paymentId, PaymentStatus.PAID)
        .toPromise();
      this.txState.setPaymentStatus(PaymentStatus.PAID);
      this.txState.setPayment(confirmed!);
      this.txState.markStepDone(TransactionStep.CALLBACK_RECEIVED);
    } catch {
      this.txState.markStepError(TransactionStep.CALLBACK_RECEIVED);
      this.resolveFlow('payment_failed', 'Gateway did not confirm payment. Please try again.');
      return;
    }

    // ── 5. Finalize Transaction ──
    this.txState.activateStep(TransactionStep.FINALIZING);
    await this.sleep(1000);

    try {
      const finalTx = await this.txService
        .finalizeTransaction(transactionId)
        .toPromise();
      this.txState.setTransaction(finalTx!);
      this.txState.markStepDone(TransactionStep.FINALIZING);
    } catch {
      this.txState.markStepError(TransactionStep.FINALIZING);
      this.resolveFlow('payment_failed', 'Transaction finalization failed.');
      return;
    }

    // ── 6. Sync Inventory (best-effort) ──
    this.txState.activateStep(TransactionStep.SYNCING_INVENTORY);
    this.txState.setSyncStatus('syncing');
    await this.sleep(1200);
    this.txState.setSyncStatus('synced');
    this.txState.markStepDone(TransactionStep.SYNCING_INVENTORY);

    // ── 7. Done ──
    this.txState.activateStep(TransactionStep.DONE);
    this.txState.markStepDone(TransactionStep.DONE);
    await this.sleep(500);

    this.resolveFlow('success');
  }

  /** Map frontend PaymentMethod to backend PaymentType enum values */
  private mapPaymentMethod(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.UPI:         return 'UPI';
      case PaymentMethod.CARD:        return 'CREDIT_CARD';
      case PaymentMethod.NET_BANKING: return 'BANK_TRANSFER';
      case PaymentMethod.WALLET:      return 'WALLET';
      default:                        return 'UPI';
    }
  }

  private resolveFlow(
    resolution: 'success' | 'payment_failed' | 'sync_failed',
    reason?: string
  ): void {
    this.txState.resolve(resolution, reason);
    setTimeout(() => this.view.set('resolution'), 700);
  }

  // ── User actions on resolution screen ───────────────────────────────────
  onRetryPayment(): void {
    this.txState.reset();
    this.view.set('checkout');
    this.showPaymentSheet.set(true);
  }

  onRetrySync(): void {
    this.toast.show('Retrying inventory sync…', 'info');
    setTimeout(() => {
      this.txState.resolve('success');
      this.toast.show('Inventory synced successfully ✓', 'success');
    }, 2000);
  }

  onNewOrder(): void {
    this.txState.reset();
    this.router.navigate(['/dashboard/trader/croplistings']);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }

  // ── Mock order fallback ─────────────────────────────────────────────────
  private buildMockOrder(orderId: number): CheckoutOrder {
    const items: OrderItem[] = [
      { cropName: 'Premium Basmati Rice', quantity: 30, unit: 'kg', pricePerUnit: 72,  subtotal: 2160 },
      { cropName: 'Organic Wheat',        quantity: 20, unit: 'kg', pricePerUnit: 28,  subtotal: 560  },
    ];
    const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
    const platformFee = +(subtotal * 0.02).toFixed(2);
    return {
      orderId,
      listingId:         42,
      traderId:           7,
      quantity:          50,
      orderDate:         new Date().toISOString().split('T')[0],
      orderStatus:       'CONFIRMED',
      items,
      subtotal,
      platformFee,
      grandTotal:        +(subtotal + platformFee).toFixed(2),
      deliveryAddress:   'Agri Market Hub, Pune – 411001, Maharashtra',
      estimatedDelivery: '3–5 business days',
      farmerName:        'Ramesh Patil',
      cropName:          'Mixed Produce',
    };
  }

  ngOnDestroy(): void {
    this.txState.reset();
  }
}
