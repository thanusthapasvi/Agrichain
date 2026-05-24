import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketService } from '../../../services/market';
import { TraderApiService } from '../../../services/trader.service';

@Component({
  selector: 'app-trader-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trader.html',
  styleUrl: './trader.css'
})
export class TraderPage implements OnInit {
  private marketService = inject(MarketService);
  private traderservice = inject(TraderApiService);
  
  activeModule = 'dashboard';
  currentTab = signal<'home' | 'listings'>('home');

  pendingListings: any[] = []; 
  
  listings = signal<any[]>([]);
  myOrders = signal<any[]>([]);
  myTransactions = signal<any[]>([]);
  auditLogs = signal<any[]>([]);
  
  traderId = 101;
  pendingPaymentsCount: number = 0;

  constructor() {
    this.myTransactions.set([
      { transactionId: 101, orderId: 5001, transactionAmount: 15000, transactionDate: new Date(), transactionStatus: 'PENDING' },
      { transactionId: 102, orderId: 5002, transactionAmount: 8500, transactionDate: new Date(), transactionStatus: 'COMPLETED' }
    ]);

    this.auditLogs.set([
      { timestamp: new Date(), targetType: 'CROP', targetId: 201, action: 'APPROVED', reason: 'Quality standards met' },
      { timestamp: new Date(), targetType: 'CROP', targetId: 202, action: 'REJECTED', reason: 'Incomplete documentation' }
    ]);
  }

  ngOnInit(): void {
    this.loadMarketCrops();
    this.loadAuditLogs();
  }

  loadMarketCrops(): void {
    console.log("📡 Fetching validated crops...");
    this.marketService.getListingsByStatus('VALIDATED').subscribe({
      next: (data: any[]) => {
        // FILTER: Only keep items where quantity is greater than 0
        const availableCrops = data.filter(item => item.quantity > 0);
        
        // Update the signal for summary cards
        this.listings.set(availableCrops); 
        
        // Update the array for the table
        this.pendingListings = availableCrops; 
        
        console.log("✅ Filtered Market Data Loaded:", availableCrops);
      },
      error: (err) => {
        console.error('❌ Failed to load validated market data', err);
      }
    });
  }

  loadAuditLogs(): void {
    this.marketService.getAllLogs().subscribe({
      next: (logs) => {
        this.auditLogs.set(logs);
      },
      error: (err) => console.error('❌ Failed to load logs', err)
    });
  }

  setModule(moduleName: string): void {
    this.activeModule = moduleName;
  }
}