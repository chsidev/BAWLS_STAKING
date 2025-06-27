import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

type HistoryEntry = {
  type: 'Staked' | 'Unstaked' | 'Claimed';
  amount: number;
  timestamp: Date;
  txhash: string;
};

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent {
  sortColumn: keyof HistoryEntry = 'timestamp';
  sortAsc = false;

  constructor( private toastr: ToastrService ) {}

  history: HistoryEntry[] = Array.from({ length: 20 }).map((_, i) => ({
    type: ['Staked', 'Unstaked', 'Claimed'][Math.floor(Math.random() * 3)] as any,
    amount: Math.floor(Math.random() * 50000 + 1000),
    timestamp: new Date(Date.now() - Math.random() * 1e10),
    txhash: crypto.randomUUID().replace(/-/g, '').slice(0, 32),
  }));

  sortBy(column: keyof HistoryEntry) {
    if (this.sortColumn === column) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortColumn = column;
      this.sortAsc = true;
    }
  }

  get sortedHistory() {
    return [...this.history].sort((a, b) => {
      const valA = a[this.sortColumn];
      const valB = b[this.sortColumn];
      return this.sortAsc
        ? valA > valB ? 1 : -1
        : valA < valB ? 1 : -1;
    });
  }

  copyHash(hash: string) {
    navigator.clipboard.writeText(hash).then(() => {
      this.toastr.success('TxHash Copied!', 'Success');
    });
  }
  
  truncate(wallet: string): string {
    return wallet.slice(0, 4) + '...' + wallet.slice(-4);
  }
}
