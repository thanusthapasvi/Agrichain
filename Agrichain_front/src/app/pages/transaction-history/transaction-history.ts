import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { ToastService }       from '../../services/toast-service';
import { Transaction, TransactionStatus } from '../../models/transaction.model';

type FilterChip = 'ALL' | 'COMPLETED' | 'PENDING' | 'FAILED';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './transaction-history.html',
  styleUrl: './transaction-history.css',
})
export class TransactionHistoryComponent implements OnInit {
  private txService = inject(TransactionService);
  private toast     = inject(ToastService);

  transactions  = signal<Transaction[]>([]);
  loading       = signal(true);
  activeFilter  = signal<FilterChip>('ALL');
  expandedId    = signal<number | null>(null);

  readonly chips: FilterChip[] = ['ALL', 'COMPLETED', 'PENDING', 'FAILED'];

  readonly filtered = computed(() => {
    const f = this.activeFilter();
    const all = this.transactions();
    return f === 'ALL' ? all : all.filter(t => t.transactionStatus === f);
  });

  count(chip: FilterChip): number {
    const all = this.transactions();
    return chip === 'ALL' ? all.length : all.filter(t => t.transactionStatus === chip).length;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.txService.getTransactionHistory().subscribe({
      next: txs => {
        this.transactions.set(txs);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.show('Could not load transaction history', 'alert');
        // Fallback mock data for offline/dev
        this.transactions.set(this.mockTransactions());
      },
    });
  }

  setFilter(chip: FilterChip): void {
    this.activeFilter.set(chip);
    this.expandedId.set(null);
  }

  toggle(id: number): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  platformFee(amount: number): number {
    return +(amount - amount / 1.02).toFixed(2);
  }

  baseAmount(amount: number): number {
    return +(amount / 1.02).toFixed(2);
  }

  private mockTransactions(): Transaction[] {
    return [
      { transactionId: 1001, orderId: 42, transactionAmount: 2774.40, transactionDate: new Date().toISOString(), transactionStatus: TransactionStatus.COMPLETED },
      { transactionId: 1002, orderId: 43, transactionAmount: 1530.00, transactionDate: new Date(Date.now() - 86400000).toISOString(), transactionStatus: TransactionStatus.PENDING },
      { transactionId: 1003, orderId: 44, transactionAmount:  890.50, transactionDate: new Date(Date.now() - 2 * 86400000).toISOString(), transactionStatus: TransactionStatus.FAILED },
    ];
  }
}
