import { Injectable, signal, computed } from '@angular/core';
import {
  TransactionStep,
  StepState,
  PaymentStatus,
  PaymentMethod,
  Transaction,
  Payment,
  TransactionStatus,
} from '../models/transaction.model';

export interface TransactionFlowState {
  steps:         StepState[];
  currentStep:   TransactionStep;
  transaction:   Transaction | null;
  payment:       Payment | null;
  paymentStatus: PaymentStatus | null;
  syncStatus:    'idle' | 'syncing' | 'synced' | 'failed';
  resolution:    'none' | 'success' | 'payment_failed' | 'sync_failed';
  errorReason?:  string;
}

const STEP_DEFINITIONS: Omit<StepState, 'status' | 'timestamp'>[] = [
  { step: TransactionStep.INITIATING,        label: 'Initiating Transaction',    apiLabel: 'POST /transactions/initiate' },
  { step: TransactionStep.RECORDING,         label: 'Recording Payment',         apiLabel: 'POST /transactions/payment/record' },
  { step: TransactionStep.AWAITING_GATEWAY,  label: 'Awaiting Gateway',          apiLabel: 'GET  /payments/filter  ↺ 3s' },
  { step: TransactionStep.CALLBACK_RECEIVED, label: 'Gateway Callback Received', apiLabel: 'PUT  /payments/confirm/{id}' },
  { step: TransactionStep.FINALIZING,        label: 'Finalizing Transaction',    apiLabel: 'PUT  /transactions/{id}/finalize' },
  { step: TransactionStep.SYNCING_INVENTORY, label: 'Syncing Inventory',         apiLabel: 'Market Client — internal' },
  { step: TransactionStep.DONE,              label: 'Done',                      apiLabel: '✓ Complete' },
];

const buildInitialState = (): TransactionFlowState => ({
  steps:         STEP_DEFINITIONS.map(d => ({ ...d, status: 'pending' })),
  currentStep:   TransactionStep.INITIATING,
  transaction:   null,
  payment:       null,
  paymentStatus: null,
  syncStatus:    'idle',
  resolution:    'none',
});

@Injectable({ providedIn: 'root' })
export class TransactionStateService {

  // Using Angular signals to match the project's existing pattern (see toast-service.ts)
  private _state = signal<TransactionFlowState>(buildInitialState());
  readonly state = this._state.asReadonly();

  readonly currentStep   = computed(() => this._state().currentStep);
  readonly paymentStatus = computed(() => this._state().paymentStatus);
  readonly syncStatus    = computed(() => this._state().syncStatus);
  readonly resolution    = computed(() => this._state().resolution);

  reset(): void {
    this._state.set(buildInitialState());
  }

  activateStep(step: TransactionStep): void {
    this._state.update(s => ({
      ...s,
      currentStep: step,
      steps: s.steps.map(st => {
        if (st.step < step)  return { ...st, status: 'done' as const };
        if (st.step === step) return { ...st, status: 'active' as const, timestamp: new Date().toLocaleTimeString() };
        return { ...st, status: 'pending' as const };
      }),
    }));
  }

  markStepDone(step: TransactionStep): void {
    this._state.update(s => ({
      ...s,
      steps: s.steps.map(st =>
        st.step === step
          ? { ...st, status: 'done' as const, timestamp: st.timestamp ?? new Date().toLocaleTimeString() }
          : st
      ),
    }));
  }

  markStepError(step: TransactionStep): void {
    this._state.update(s => ({
      ...s,
      steps: s.steps.map(st =>
        st.step === step
          ? { ...st, status: 'error' as const, timestamp: new Date().toLocaleTimeString() }
          : st
      ),
    }));
  }

  setTransaction(tx: Transaction): void {
    this._state.update(s => ({ ...s, transaction: tx }));
  }

  setPayment(p: Payment): void {
    this._state.update(s => ({ ...s, payment: p }));
  }

  setPaymentStatus(status: PaymentStatus): void {
    this._state.update(s => ({ ...s, paymentStatus: status }));
  }

  setSyncStatus(syncStatus: TransactionFlowState['syncStatus']): void {
    this._state.update(s => ({ ...s, syncStatus }));
  }

  resolve(resolution: TransactionFlowState['resolution'], errorReason?: string): void {
    this._state.update(s => ({
      ...s,
      resolution,
      errorReason,
      steps: s.steps.map(st =>
        st.status === 'active'
          ? { ...st, status: (resolution === 'success' ? 'done' : 'error') as 'done' | 'error' }
          : st
      ),
    }));
  }
}
