import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ApiService, LeaderboardEntry } from '../../services/api.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {
  @Input() currentUserWallet: string | null = null;

  sortColumn: keyof LeaderboardEntry = 'rank';
  sortAsc = true;

  leaderboard: LeaderboardEntry[] = [];

  constructor(
    private api: ApiService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadLeaderboard();
  }

  loadLeaderboard() {
    this.api.getLeaderboard().subscribe({
      next: (data) => {
        console.log('[LeaderboardComponent] Loaded leaderboard:', data);
        this.leaderboard = data;
      },
      error: (err) => {
        console.error('[LeaderboardComponent] Failed to load leaderboard:', err);
        this.toastr.error('Failed to load leaderboard');
      }
    });
  }

  refresh() {
    console.log('[LeaderboardComponent] Manual refresh triggered');
    this.loadLeaderboard();
  }

  get sortedLeaderboard() {
    return [...this.leaderboard].sort((a, b) => {
      const valA = a[this.sortColumn];
      const valB = b[this.sortColumn];
      return this.sortAsc
        ? valA > valB ? 1 : -1
        : valA < valB ? 1 : -1;
    });
  }

  sortBy(column: keyof LeaderboardEntry) {
    if (this.sortColumn === column) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortColumn = column;
      this.sortAsc = true;
    }
  }

  getBadgeIcon(badge: string): string {
    switch (badge.toLowerCase()) {
      case 'baby bawler':
        return 'baby-bawler.png';
      case 'og bawler':
        return 'og-bawler.png';
      case 'diamond bawler':
        return 'diamond-bawler.png';
      case 'big bawler':
        return 'big-bawler.png';
      case 'bawler legend':
        return 'legend-bawler.png';
      default:
        return 'baby-bawler.png';
    }
  }

  isCurrentUser(wallet: string): boolean {
    return this.currentUserWallet != null && wallet === this.currentUserWallet;
  }

  truncate(wallet: string): string {
    return wallet.slice(0, 4) + '...' + wallet.slice(-4);
  }

  copyAddress(wallet: string) {
    navigator.clipboard.writeText(wallet).then(() => {
      this.toastr.success('Copied!', 'Success');
    });
  }
}
