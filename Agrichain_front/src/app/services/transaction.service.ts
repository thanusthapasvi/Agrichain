import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../elements/constants';
import { Transaction, TransactionRequestDTO } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  getOrderDetails(orderId: number) {
    throw new Error('Method not implemented.');
  }
  private http = inject(HttpClient);
  private base = `${API_URL}transactions`;

  /** POST /transactions/initiate */
  createTransaction(dto: TransactionRequestDTO): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.base}/initiate`, dto);
  }

  /** PUT /transactions/{id}/finalize */
  finalizeTransaction(transactionId: number): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.base}/${transactionId}/finalize`, {});
  }

  /** GET /transactions/status/COMPLETED */
  getTransactionHistory(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.base}/status/COMPLETED`);
  }

  /** GET /transactions/status/{status} */
  getTransactionsByStatus(status: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.base}/status/${status}`);
  }

  /** PUT /transactions/{id}/status?status=FAILED */
  updateTransactionStatus(id: number, status: string): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.base}/${id}/status`, null, {
      params: { status },
    });
  }
}
