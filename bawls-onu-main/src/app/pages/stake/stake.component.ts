import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WalletService } from '../../services/wallet.service';
import { AnchorService } from '../../services/anchor.service';
import { LeaderboardComponent } from '../leaderboard/leaderboard.component';
// @ts-ignore
import { BN } from 'bn.js';

@Component({
  selector: 'app-stake',
  standalone: true,
  imports: [FormsModule, CommonModule, LeaderboardComponent],
  templateUrl: './stake.component.html',
  styleUrl: './stake.component.scss',
})
export class StakeComponent {
  constructor(
    private walletService: WalletService,
    private anchorService: AnchorService,
    private toastr: ToastrService
  ) {}

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

    const connected = await this.walletService.connectWallet(); 
    if (connected) {
      this.walletAddress = this.walletService.publicKey?.toBase58() ?? null;      
      await this.anchorService.init(window.solana);
      await this.refreshUserState();
    }
  }

  toggleLeaderboard() {
    this.showLeaderboard = !this.showLeaderboard;
  }

  async connectWallet() {
    const wallet = await this.walletService.connectWallet();
    if (wallet) {
      this.walletAddress = this.walletService.publicKey?.toBase58() ?? null;
      await this.anchorService.init(wallet);
      await this.refreshUserState();
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
    await this.anchorService.stake(this.walletAddress, this.stakeAmount);
    await this.refreshUserState();
    this.toastr.success('Staked successfully!');
  }

  async unstake() {
    if (!this.walletAddress || this.userStake <= 0) return;
    await this.anchorService.ensureUserAccount(this.walletAddress);
    await this.anchorService.unstake(this.walletAddress);
    await this.refreshUserState();
    this.toastr.info('Unstaking initiated.');
  }

  async claim() {
    if (!this.walletAddress || this.rewards <= 0) return;
    await this.anchorService.ensureUserAccount(this.walletAddress);
    await this.anchorService.claimRewards(this.walletAddress);
    await this.refreshUserState();
    this.toastr.success('Rewards claimed!');
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
