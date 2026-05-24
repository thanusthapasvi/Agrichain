import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutOrder } from '../../models/transaction.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class CheckoutComponent {
  @Input() order: CheckoutOrder | null = null;
  @Output() proceedToPay = new EventEmitter<{ grandTotal: number }>();

  get subtotal(): number {
    return this.order?.subtotal ?? 0;
  }
  get platformFee(): number {
    return +(this.subtotal * 0.02).toFixed(2);
  }
  get grandTotal(): number {
    return +(this.subtotal + this.platformFee).toFixed(2);
  }

  onProceed(): void {
    this.proceedToPay.emit({ grandTotal: this.grandTotal });
  }
}
