
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

export interface WalletResponse {
  walletId: number;
  balance: number;
  currency: string;
  createdAt: string;
}

export interface DepositRequest {
  amount: number;
  description?: string;
}

export interface WithdrawalRequest {
  amount: number;
  description?: string;
}

export interface WalletTransaction {
  transactionId: number;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/wallets`;

  createWallet(): Observable<WalletResponse> {
    return this.http.post<WalletResponse>(this.baseUrl, {});
  }

  getMyWallet(): Observable<WalletResponse> {
    return this.http.get<WalletResponse>(`${this.baseUrl}/me`);
  }

  deposit(data: DepositRequest): Observable<unknown> {
    return this.http.post(
      `${this.baseUrl}/me/deposit`,
      data
    );
  }

  withdraw(data: WithdrawalRequest): Observable<unknown> {
    return this.http.post(
      `${this.baseUrl}/me/withdraw`,
      data
    );
  }

  getTransactions(): Observable<WalletTransaction[]> {
    return this.http.get<WalletTransaction[]>(
      `${this.baseUrl}/me/transactions`
    );
  }
}
