import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionStateService } from '../../services/transaction-state.service';
import { TransactionStep } from '../../models/transaction.model';

@Component({
  selector: 'app-transaction-stepper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-stepper.html',
  styleUrl: './transaction-stepper.css',
})
export class TransactionStepperComponent implements OnInit, OnDestroy {
  protected txState = inject(TransactionStateService);
  protected TransactionStep = TransactionStep;

  showPollingWarning = false;
  private pollingTimer: ReturnType<typeof setTimeout> | null = null;

  get headerText(): string {
    switch (this.txState.resolution()) {
      case 'success':        return 'Payment Complete! 🎉';
      case 'payment_failed': return 'Payment Failed';
      case 'sync_failed':    return 'Payment Received';
      default:               return 'Processing Payment…';
    }
  }

  get isProcessing(): boolean {
    return (
      this.txState.resolution() === 'none' &&
      this.txState.currentStep() !== TransactionStep.DONE
    );
  }

  ngOnInit(): void {
    // Watch for polling step — show warning after 5 min
    const check = () => {
      if (this.txState.currentStep() === TransactionStep.AWAITING_GATEWAY) {
        if (!this.pollingTimer) {
          this.pollingTimer = setTimeout(() => {
            this.showPollingWarning = true;
          }, 5 * 60 * 1000);
        }
      } else {
        if (this.pollingTimer) {
          clearTimeout(this.pollingTimer);
          this.pollingTimer = null;
        }
        this.showPollingWarning = false;
      }
    };
    // Poll check every second (cheap signal read)
    this.pollingTimer = setInterval(check, 1000) as any;
  }

  ngOnDestroy(): void {
    if (this.pollingTimer) clearInterval(this.pollingTimer as any);
  }
}
