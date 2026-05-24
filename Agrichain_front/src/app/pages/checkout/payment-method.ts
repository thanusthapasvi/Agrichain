import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentMethod } from '../../models/transaction.model';

interface MethodCard {
  type:      PaymentMethod;
  icon:      string;
  label:     string;
  subtitle:  string;
  tag?:      string;
  tagClass?: string;
}

@Component({
  selector: 'app-payment-method',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-method.html',
  styleUrl: './payment-method.css',
})
export class PaymentMethodComponent {
  @Input()  visible    = false;
  @Input()  grandTotal = 0;
  @Output() confirmed  = new EventEmitter<PaymentMethod>();
  @Output() closed     = new EventEmitter<void>();

  selected: PaymentMethod | null = null;

  readonly methods: MethodCard[] = [
    {
      type: PaymentMethod.UPI,
      icon: '⚡',
      label: 'UPI',
      subtitle: 'Google Pay · PhonePe · BHIM & more',
      tag: 'Recommended',
      tagClass: 'tag-popular',
    },
    {
      type: PaymentMethod.CARD,
      icon: '💳',
      label: 'Credit / Debit Card',
      subtitle: 'Visa · Mastercard · RuPay',
    },
    {
      type: PaymentMethod.NET_BANKING,
      icon: '🏦',
      label: 'Net Banking',
      subtitle: 'All major Indian banks',
      tag: 'Instant',
      tagClass: 'tag-instant',
    },
    {
      type: PaymentMethod.WALLET,
      icon: '👛',
      label: 'Wallet',
      subtitle: 'Paytm · Amazon Pay · MobiKwik',
    },
  ];

  select(type: PaymentMethod): void {
    this.selected = type;
  }

  getSelected(): MethodCard | undefined {
    return this.methods.find(m => m.type === this.selected);
  }

  onConfirm(): void {
    if (this.selected) this.confirmed.emit(this.selected);
  }

  onClose(): void {
    this.closed.emit();
  }
}
