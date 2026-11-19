
import { Component, OnInit, inject, ChangeDetectorRef  } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

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
      this.cdr.markForCheck();

      this.loadTransactions();
    },

    error: (error) => {
      this.loading = false;

      if (error.status === 404) {
        // User does not have a wallet yet.
        this.wallet = null;
        this.cdr.markForCheck();
        return;
      }

      // Other errors should not be treated as missing wallets.
      this.errorMessage =
        error.error?.message || 'Unable to load your wallet.';

      this.cdr.markForCheck();
    }
  });
}


  createWallet(): void {
    this.creatingWallet = true;
    this.errorMessage = '';

    this.walletService.createWallet().subscribe({
      next: (wallet) => {
        this.wallet = wallet;
        this.cdr.markForCheck();
        this.creatingWallet = false;
        this.loadTransactions();
      },
      error: (error) => {
        this.creatingWallet = false;
        this.errorMessage =
          error.error?.message || 'Unable to create wallet.';
          this.cdr.markForCheck();
      }
    });
  }

  loadTransactions(): void {
    this.walletService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions.slice(0, 5);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
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
