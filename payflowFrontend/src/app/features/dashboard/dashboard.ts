
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import {
  WalletService,
  WalletResponse,
  WalletTransaction
} from '../../core/services/wallet.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private walletService = inject(WalletService);
  private authService = inject(AuthService);
  private router = inject(Router);

  wallet: WalletResponse | null = null;
  transactions: WalletTransaction[] = [];

  loading = true;
  creatingWallet = false;
  processing = false;
  errorMessage = '';
  successMessage = '';

  action: 'DEPOSIT' | 'WITHDRAWAL' = 'DEPOSIT';
  amount: number | null = null;
  description = '';

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    this.walletService.getMyWallet().subscribe({
      next: (wallet) => {
        this.wallet = wallet;
        this.loadTransactions();
      },
      error: (error) => {
        this.loading = false;

        if (error.status === 404) {
          this.wallet = null;
          return;
        }

        this.errorMessage =
          error.error?.message || 'Unable to load your wallet.';
      }
    });
  }

  createWallet(): void {
    this.creatingWallet = true;
    this.errorMessage = '';

    this.walletService.createWallet().subscribe({
      next: (wallet) => {
        this.wallet = wallet;
        this.creatingWallet = false;
        this.loadTransactions();
      },
      error: (error) => {
        this.creatingWallet = false;
        this.errorMessage =
          error.error?.message || 'Unable to create wallet.';
      }
    });
  }

  loadTransactions(): void {
    this.walletService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions.slice(0, 5);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  selectAction(action: 'DEPOSIT' | 'WITHDRAWAL'): void {
    this.action = action;
    this.amount = null;
    this.description = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  submitTransaction(): void {
    if (!this.amount || this.amount <= 0) {
      this.errorMessage = 'Please enter a valid amount.';
      return;
    }

    if (!this.wallet) {
      this.errorMessage = 'Please create a wallet first.';
      return;
    }

    this.processing = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request = {
      amount: this.amount,
      description: this.description.trim() || undefined
    };

    const operation = this.action === 'DEPOSIT'
      ? this.walletService.deposit(request)
      : this.walletService.withdraw(request);

    operation.subscribe({
      next: () => {
        this.processing = false;
        this.successMessage =
          this.action === 'DEPOSIT'
            ? 'Deposit completed successfully.'
            : 'Withdrawal completed successfully.';

        this.amount = null;
        this.description = '';
        this.loadDashboard();
      },
      error: (error) => {
        this.processing = false;
        this.errorMessage =
          error.error?.message || 'Transaction failed. Please try again.';
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  goToTransactions(): void {
    this.router.navigate(['/transactions']);
  }
}
