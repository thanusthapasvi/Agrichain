import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionFlowState } from '../../services/transaction-state.service';

@Component({
  selector: 'app-resolution',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resolution.html',
  styleUrl: './resolution.css',
})
export class ResolutionComponent {
  @Input()  state: TransactionFlowState | null = null;
  @Output() retryPayment = new EventEmitter<void>();
  @Output() retrySync    = new EventEmitter<void>();
  @Output() newOrder     = new EventEmitter<void>();
  @Output() viewHistory  = new EventEmitter<void>();

  // Confetti pieces for success screen
  readonly confetti = Array.from({ length: 14 }, (_, i) => ({
    x:     10 + Math.random() * 80,
    color: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'][i % 5],
    delay: +(Math.random() * 0.8).toFixed(2),
    shape: Math.random() > 0.5 ? '50%' : '2px',
  }));
}
