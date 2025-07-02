import { Component, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { WalletService } from '../../services/wallet.service';
import { AnchorService } from '../../services/anchor.service';
import { HistoryComponent } from '../history/history.component';
import { StakeInfoComponent } from '../stake-info/stake-info.component';
import { LeaderboardComponent } from '../leaderboard/leaderboard.component';
import { environment } from '../../../environments/environment.development';
// @ts-ignore
import { BN } from 'bn.js';

@Component({
  selector: 'app-stake',
  standalone: true,
  imports: [FormsModule, CommonModule, LeaderboardComponent, HistoryComponent, StakeInfoComponent],
  templateUrl: './stake.component.html',
  styleUrl: './stake.component.scss',
})
export class StakeComponent {
  constructor(
    private walletService: WalletService,
    private anchorService: AnchorService,
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  @ViewChild(LeaderboardComponent) leaderboardComponent!: LeaderboardComponent;
  @ViewChild(HistoryComponent) historyComponent!: HistoryComponent;

  private countdownInterval: any = null;
  walletAddress: string | null = null;
  countdown: string = '';
  isCountdownUrgent: boolean = false;
  rewardChanged: boolean = false;
  isMobile: boolean = false;
  showLeaderboard: boolean = false;
  startTime: number = 0;
  stakeAmount = 0;
  userStake = 0;
  rewards = 0;

  async ngOnInit() {
    this.isMobile = window.innerWidth <= 768;
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
    });

    const response = await this.walletService.connectWallet(); 
    if (response && response.publicKey) {
      this.walletAddress = response.publicKey.toBase58().trim();
      console.log('ngOnInit detected walletAddress:', this.walletAddress);

      await this.anchorService.init(window.solana);
      await this.refreshUserState();
    }
  }

  toggleLeaderboard() {
    this.showLeaderboard = !this.showLeaderboard;
  }

  async connectWallet() {
    try {
      const response = await this.walletService.connectWallet();

      if (response && response.publicKey) {
        this.walletAddress = response.publicKey.toBase58().trim();
        console.log('Connected walletAddress:', this.walletAddress);

        await this.anchorService.init(window.solana);
        await this.refreshUserState();
      } else {
        this.toastr.error('Wallet connection failed');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      this.toastr.error('Error connecting wallet');
    }
  }
  
  disconnectWallet(): void {
    this.walletService.disconnectWallet();
    this.walletAddress = null;
    this.userStake = 0;
    this.rewards = 0;
    this.stakeAmount = 0;
  }

  async startCountdown(startTime: number) {
    if (this.countdownInterval) clearInterval(this.countdownInterval);

    const taxFreeAfterSeconds = 90 * 24 * 60 * 60; 

    this.countdownInterval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const elapsed = now - startTime;
      const remaining = taxFreeAfterSeconds - elapsed;

      this.isCountdownUrgent = remaining <= 24 * 60 * 60;

      if (remaining <= 0) {
        this.countdown = 'You can now unstake with no tax!';
        clearInterval(this.countdownInterval);
        return;
      }

      const days = Math.floor(remaining / 86400);
      const hours = Math.floor((remaining % 86400) / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = remaining % 60;

      this.countdown = ` ⏱ Tax-free unstake in: ${days}d ${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
  }

  async stake() {
    if (!this.walletAddress || this.stakeAmount <= 0) return;
    await this.anchorService.ensureUserAccount(this.walletAddress);
    const txHash = await this.anchorService.stake(this.walletAddress, this.stakeAmount);
    await this.logHistory('stake', this.stakeAmount, txHash);
    if (this.historyComponent) {
      this.historyComponent.refresh();
    }
    if (this.leaderboardComponent) {
      this.leaderboardComponent.refresh();
    }
    await this.refreshUserState();
    this.toastr.success('Staked successfully!');
  }

  async unstake() {
    if (!this.walletAddress || this.userStake <= 0) return;
    await this.anchorService.ensureUserAccount(this.walletAddress);
    const txHash = await this.anchorService.unstake(this.walletAddress);
    await this.logHistory('unstake', this.userStake, txHash);
    if (this.historyComponent) {
      this.historyComponent.refresh();
    }
    if (this.leaderboardComponent) {
      this.leaderboardComponent.refresh();
    }
    await this.refreshUserState();
    this.toastr.info('Unstaking initiated.');
  }

  async claim() {
    if (!this.walletAddress || this.rewards <= 0) return;
    await this.anchorService.ensureUserAccount(this.walletAddress);
    const txHash = await this.anchorService.claimRewards(this.walletAddress);
    await this.logHistory('claim', this.rewards, txHash);
    if (this.historyComponent) {
      this.historyComponent.refresh();
    }
    if (this.leaderboardComponent) {
      this.leaderboardComponent.refresh();
    }
    await this.refreshUserState();
    this.toastr.success('Rewards claimed!');
  }

  async logHistory(type: 'stake' | 'unstake' | 'claim', amount: number, txHash: string) {
    if (!this.walletAddress || !txHash) return;
    try {
      await this.http.post(`${environment.apiUrl}/history`, {
        wallet: this.walletAddress,
        type,
        amount,
        txHash
      }).toPromise();
    } catch (e) {
      console.error('Failed to log history', e);
    }
  }

  async refreshUserState() {
    const userState = await this.anchorService.getUserState(this.walletAddress!);
    this.userStake = new BN(userState.amount).div(new BN(1e9)).toNumber();
    this.startTime = new BN(userState.startTime).toNumber();

    this.startCountdown(this.startTime);

    const newRewards = await this.anchorService.getClaimableRewards(this.walletAddress!);

    if (newRewards !== this.rewards) {
      this.rewardChanged = true;
      setTimeout(() => { this.rewardChanged = false; }, 600);
    }
    this.rewards = newRewards;
  }

  get daysStaked(): number {
    if (!this.startTime) return 0;
    const now = Math.floor(Date.now() / 1000);
    return Math.floor((now - this.startTime) / 86400);
  }

  get badgeLevel(): string {
    const d = this.daysStaked;
    if (d >= 120) return "💎 DIAMOND BAWLER";
    if (d >= 90) return "🔥 BAWLER LEGEND";
    if (d >= 60) return "💪 BIG BAWLER";
    if (d >= 30) return "😎 OG BAWLER";
    return "👶 BABY BAWLER";
  }
}
