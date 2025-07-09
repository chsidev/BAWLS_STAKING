import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService, HistoryEntry } from '../../services/api.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent {
  @Input() walletAddress: string | null = null;

  history: HistoryEntry[] = [];
  loading = false;
  error = '';

  sortColumn: keyof HistoryEntry = 'timestamp';
  sortAsc = false;

  constructor( 
    private api: ApiService,
    private toastr: ToastrService 
  ) {}

  ngOnInit() {
    if (this.walletAddress) {
      console.log('[HistoryComponent] ngOnInit detected walletAddress:', this.walletAddress);
      this.loadHistory(this.walletAddress);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['walletAddress'] && this.walletAddress) {
      console.log('[HistoryComponent] ngOnChanges detected walletAddress change:', this.walletAddress);
      this.loadHistory(this.walletAddress);
    }
  }

  
  loadHistory(wallet: string) {
    if (!wallet) {
      this.error = 'No wallet address provided';
      return;
    }
    
    console.log('[HistoryComponent] loadHistory called with wallet:', wallet);

    this.loading = true;
    this.error = '';

    this.api.getUserHistory(wallet).subscribe({
      next: (data) => {
        this.history = data.map(entry => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
          displayType: entry.type.charAt(0).toUpperCase() + entry.type.slice(1) 
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load history';
        this.loading = false;
        this.toastr.error('Could not load history from server');
      }
    });
  }

  public refresh() {
    if (this.walletAddress) {
      console.log('[HistoryComponent] refresh called for wallet:', this.walletAddress);
      this.loadHistory(this.walletAddress);
    } else {
      console.warn('[HistoryComponent] refresh called but no wallet address set');
    }
  } 

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
        
      if (valA == null && valB == null) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

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
