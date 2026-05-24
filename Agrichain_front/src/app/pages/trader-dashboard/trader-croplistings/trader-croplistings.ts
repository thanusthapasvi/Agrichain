import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
<<<<<<< HEAD
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MarketService } from '../../../services/market';
import { CropListingDTO } from '../../../models/dto.model';
import { API_URL } from '../../../elements/constants';
import { Farmer } from '../../../models/user.model';
import { AuthService } from '../../../services/auth-service';
=======
import { MarketService } from '../../../services/market'; // Adjust path based on your folder structure
import { CropListingDTO } from '../../../models/dto.model';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../../elements/constants';
import { Farmer } from '../../../models/user.model';
>>>>>>> 3a69c7932c51cb5bfa775fb20c2419cdcd61bcaa
import { catchError, finalize, forkJoin, map, switchMap } from 'rxjs';
import { Loader } from '../../../common-components/loader/loader';

@Component({
  selector: 'trader-croplistings',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, FormsModule, Loader],
=======
  imports: [CommonModule, Loader],
>>>>>>> 3a69c7932c51cb5bfa775fb20c2419cdcd61bcaa
  templateUrl: './trader-croplistings.html',
  styleUrl: './trader-croplistings.css'
})
export class TraderCroplistings implements OnInit {
  private marketService = inject(MarketService);
  private http = inject(HttpClient);
<<<<<<< HEAD
  private router = inject(Router);
  private authService = inject(AuthService);

  listings = signal<CropListingDTO[]>([]);
  isLoading = signal<boolean>(false);
  cropLists = signal<any[]>([]);
  placingOrder: Record<number, boolean> = {};
=======

  // Signal to hold the 50+ items we saw in your console
  listings = signal<CropListingDTO[]>([]);
>>>>>>> 3a69c7932c51cb5bfa775fb20c2419cdcd61bcaa

  ngOnInit(): void {
    this.loadMarketCrops();
  }

<<<<<<< HEAD
=======

  isLoading = signal<boolean>(false);
  cropLists = signal<CropListingDTO[]>([]);

>>>>>>> 3a69c7932c51cb5bfa775fb20c2419cdcd61bcaa
  loadMarketCrops(): void {
    this.isLoading.set(true);

    this.marketService.getListingsByStatus('VALIDATED').pipe(
      switchMap((listings: any[]) => {
        if (!listings || listings.length === 0) return [[]];

        const requests = listings.map(d =>
          this.http.get<Farmer>(`${API_URL}farmers/${d.farmerId}`).pipe(
<<<<<<< HEAD
            map(farmerData => {
              // Logic: Default buyQty to 10, or total available if less than 10
              const initialBuyQty = d.quantity < 10 ? d.quantity : 10;
              return {
                ...d,
                farmerNumber: farmerData.contactInfo,
                buyQty: initialBuyQty
              };
            }),
            catchError(() => {
              console.warn(`Could not fetch details for farmer ${d.farmerId}`);
              const initialBuyQty = d.quantity < 10 ? d.quantity : 10;
              return [{ ...d, farmerNumber: 'N/A', buyQty: initialBuyQty }];
=======
            map(farmerData => ({
              ...d,
              farmerNumber: farmerData.contactInfo
            })),
            catchError(() => {
              console.warn(`Could not fetch details for farmer ${d.farmerId}`);
              return [{ ...d, farmerNumber: 'N/A' }];
>>>>>>> 3a69c7932c51cb5bfa775fb20c2419cdcd61bcaa
            })
          )
        );
        return forkJoin(requests);
      }),
      finalize(() => this.isLoading.set(false))
    ).subscribe({
<<<<<<< HEAD
      next: (enrichedCrops) => this.cropLists.set(enrichedCrops as any[]),
      error: (err) => console.error('Critical failure in stream:', err)
    });
  }

  onBuyNow(item: any, event: Event): void {
    event.stopPropagation();
    const qty = item['buyQty'] ?? 10;
    const user = this.authService.currentUser();
    const traderId = user?.id ?? 0;

    if (!traderId) {
      alert('Could not identify trader. Please log in again.');
      return;
    }

    this.placingOrder[item.listingId] = true;

    const orderPayload = {
      listingId: item.listingId,
      traderId,
      quantity: qty,
      orderDate: new Date().toISOString().split('T')[0],
    };

    this.http.post<any>(`${API_URL}market/placeorder`, orderPayload).subscribe({
      next: (order) => {
        this.placingOrder[item.listingId] = false;
        this.router.navigate(['/dashboard/trader/checkout', order.orderId], {
          state: { order, listing: item, quantity: qty }
        });
      },
      error: (err) => {
        this.placingOrder[item.listingId] = false;
        console.error('Order placement failed', err);
        alert('Failed to place order. Please try again.');
      }
    });
  }

  increaseQty(item: any, event: Event): void {
    event.stopPropagation();
    const currentQty = item['buyQty'] ?? 1;
    if (currentQty < item.quantity) {
      item['buyQty'] = currentQty + 1;
    }
  }

  decreaseQty(item: any, event: Event): void {
    event.stopPropagation();
    const currentQty = item['buyQty'] ?? 1;
    if (currentQty > 1) {
      item['buyQty'] = currentQty - 1;
    }
  }
=======
      next: (enrichedCrops) => this.cropLists.set(enrichedCrops),
      error: (err) => console.error('Critical failure in stream:', err)
    });
  }
>>>>>>> 3a69c7932c51cb5bfa775fb20c2419cdcd61bcaa
}