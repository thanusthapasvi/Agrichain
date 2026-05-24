import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../elements/constants';
import { Payment, PaymentRequestDTO, PaymentStatus } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private base = `${API_URL}`;

  /**
   * POST /transactions/payment/record
   * Records the payment against a transaction.
   * If this fails → stop the flow immediately (do not advance stepper).
   */
  recordPayment(dto: PaymentRequestDTO): Observable<Payment> {
    return this.http.post<Payment>(`${this.base}transactions/payment/record`, dto);
  }

  /**
   * PUT /payments/confirm/{paymentId}?status=PAID
   * Simulates the gateway callback confirming the payment.
   */
  confirmPayment(paymentId: number, status: PaymentStatus): Observable<Payment> {
    return this.http.put<Payment>(`${this.base}payments/confirm/${paymentId}`, null, {
      params: { status },
    });
  }

  /**
   * PUT /transactions/payment/callback/{paymentId}
   * Admin / test-only: manually trigger gateway callback.
   */
  triggerCallback(paymentId: number, status: PaymentStatus): Observable<Payment> {
    return this.http.put<Payment>(
      `${this.base}transactions/payment/callback/${paymentId}`,
      null,
      { params: { status } }
    );
  }

  /**
   * GET /payments/filter?status=...
   * Fetch all payments filtered by status.
   */
  getPaymentsByStatus(status: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.base}payments/filter`, {
      params: { status },
    });
  }
}
