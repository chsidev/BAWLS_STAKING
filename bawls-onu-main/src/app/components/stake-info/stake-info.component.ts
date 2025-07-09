import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { connect } from 'http2';

@Component({
  selector: 'app-stake-info',
  templateUrl: './stake-info.component.html',
  styleUrls: ['./stake-info.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule], 
})
export class StakeInfoComponent {
  @Input() walletAddress: string | null = null;

  @Input() stakeAmount: number = 0;
  @Output() stakeAmountChange = new EventEmitter<number>();

  @Input() userStake: number = 0;
  @Input() rewards: number = 0;
  @Input() badgeLevel: string = '';
  @Input() rewardChanged: boolean = false;
  @Input() daysStaked: number = 0;
  @Input() countdown: string = '';
  @Input() showLeaderboard: boolean = false;
  @Input() isCountdownUrgent: boolean = false;

  @Input() stake: () => void = () => {};
  @Input() unstake: () => void = () => {};
  @Input() claim: () => void = () => {};
  @Input() connectWallet: () => void = () => {};
  @Input() disconnectWallet: () => void = () => {};

  @Output() stakeClicked = new EventEmitter<void>();
  @Output() unstakeClicked = new EventEmitter<void>();
  @Output() claimClicked = new EventEmitter<void>();
  @Output() connectWalletClicked = new EventEmitter<void>();
  @Output() disconnectWalletClicked = new EventEmitter<void>();
  @Output() toggleLeaderboardClicked = new EventEmitter<void>();
}
