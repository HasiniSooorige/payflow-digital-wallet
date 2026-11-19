
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import {
  WalletService,
  WalletTransaction
} from '../../core/services/wallet.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink, RouterLinkActive],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss'
})
export class Transactions implements OnInit {
  private walletService = inject(WalletService);
  private authService = inject(AuthService);

  transactions: WalletTransaction[] = [];
  currency = 'LKR';
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    this.errorMessage = '';

    this.walletService.getMyWallet().subscribe({
      next: wallet => {
        this.currency = wallet.currency;

        this.walletService.getTransactions().subscribe({
          next: transactions => {
            this.transactions = transactions;
            this.loading = false;
          },
          error: error => {
            this.loading = false;
            this.errorMessage =
              error.error?.message || 'Unable to load transactions.';
          }
        });
      },
      error: error => {
        this.loading = false;
        this.errorMessage =
          error.status === 404
            ? 'Please create a wallet before viewing transactions.'
            : error.error?.message || 'Unable to load your wallet.';
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
