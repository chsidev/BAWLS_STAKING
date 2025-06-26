import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

type LeaderboardEntry = {
  rank: number;
  wallet: string;
  amount: number;
  days: number;
  status: string;
};

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss'
})

export class LeaderboardComponent {
  sortColumn: keyof LeaderboardEntry = 'rank';
  sortAsc = true;
  currentUserWallet = 'F3zv7oPKshvGbHU3UzP7P1eMDTYppRSG6uRTPY7rhv7Q';

  constructor( private toastr: ToastrService ) {}
  
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

  leaderboard: LeaderboardEntry[] = [
    { rank: 1, wallet: '8r6jKwLzGuWZPbqRx6DyMLPfU1Jg7zoJ19GrnCTKwheW', amount: 2500000, days: 135, status: '💎 DIAMOND BAWLER' },
    { rank: 2, wallet: '2fJrccDYc2bhxK5gKqjzbyuGVZ2EwqTx9e9ABMdHZ1o5', amount: 1800000, days: 120, status: '🔥 BAWLER LEGEND' },
    { rank: 3, wallet: 'AYYjkkayPL8Ep2uV4D7ZQL3aTD3eaAKY2cuqovGmLutn', amount: 1300000, days: 95, status: '💪 BIG BAWLER' },
    { rank: 4, wallet: '6phjmuWjkHVyTPsjZ2iUY9vo7PYxF3TV9ZuVD8xnKkDL', amount: 600000, days: 55, status: '😎 OG BAWLER' },
    { rank: 5, wallet: 'D2Uccg7MeZTcg6eLbDNw3nctd5LdpdxkVrVusUYmEVyH', amount: 300000, days: 27, status: '👶 BABY BAWLER' },
    { rank: 6, wallet: '9vZkG5LHYoq8PgAy8UG99sfBXHRPfF2ZQrVtyk9qVTDN', amount: 290000, days: 22, status: '👶 BABY BAWLER' },
    { rank: 7, wallet: '5h3YXEyAEXEUxJd3c2HkTntZkbwZs8E9AEQ7C9QyNDjq', amount: 270000, days: 18, status: '👶 BABY BAWLER' },
    { rank: 8, wallet: '8PULuH5F4XUGKHX2Ykm6PX5P1MPRPxNS7tKZAHUwJZ1D', amount: 240000, days: 14, status: '👶 BABY BAWLER' },
    { rank: 9, wallet: 'HtT1nNfHDwBTFx8U9mMJ7S4XfYa9jvG4ceVVjV4MaXvC', amount: 230000, days: 12, status: '👶 BABY BAWLER' },
    { rank: 10, wallet: 'FUKN2KBBURzG2VCksYjMn6TRs5zCEiUqg6Dv7uqYX9kT', amount: 220000, days: 11, status: '👶 BABY BAWLER' },
    { rank: 11, wallet: '3VGZo37H57mAxSrwfTH7nXeDaa4nMRYBU3KVztrzAcGc', amount: 210000, days: 10, status: '👶 BABY BAWLER' },
    { rank: 12, wallet: '9XBKNg7RYEfPGSMPZGjvZo3mpZf1Lt4cyuGV3hzRBJso', amount: 200000, days: 9, status: '👶 BABY BAWLER' },
    { rank: 13, wallet: '6JZpHFeQNjPdUBX2DeN2zK2JDdWcX2U6cuZgZ5xyGpFi', amount: 190000, days: 8, status: '👶 BABY BAWLER' },
    { rank: 14, wallet: 'B9GoUX6GUa3XH7RdyS4P2XR8rRz9Lrmnt9Cc3AHK7AZX', amount: 180000, days: 7, status: '👶 BABY BAWLER' },
    { rank: 15, wallet: '4GJEoz9zwEw7d5PWGv6wTjDFRdfixj2jqCKaYPuFd2JP', amount: 170000, days: 6, status: '👶 BABY BAWLER' },
    { rank: 16, wallet: '6bPqXxAyGQ3rHqQkGTxAWCVtX8RgMYYqfnfCdSSFCkMw', amount: 160000, days: 5, status: '👶 BABY BAWLER' },
    { rank: 17, wallet: '9CrFd5cBAdAhEhroJvGZRSzvQJ1AdzXQ7oVaKJHAm7Rk', amount: 150000, days: 4, status: '👶 BABY BAWLER' },
    { rank: 18, wallet: 'DTLzXKJ2ZXo7kqtRxshU5LJcQx3J3HRjBoox7iVZyKgT', amount: 140000, days: 3, status: '👶 BABY BAWLER' },
    { rank: 19, wallet: '7mNVnR5eSWWgpv1SG5Qz1w8fdQ3qdgciVcmHg6AZ9GUU', amount: 130000, days: 2, status: '👶 BABY BAWLER' },
    { rank: 20, wallet: this.currentUserWallet, amount: 120000, days: 1, status: '👶 BABY BAWLER' },
  ];

  isCurrentUser(wallet: string): boolean {
    return wallet === this.currentUserWallet;
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
