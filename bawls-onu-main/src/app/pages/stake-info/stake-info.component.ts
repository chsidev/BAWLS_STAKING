import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
  @Input() userStake: number = 0;
  @Input() rewards: number = 0;
  @Input() badgeLevel: string = '';
  @Input() rewardChanged: boolean = false;
  @Input() daysStaked: number = 0;
  @Input() countdown: string = '';
  @Input() isCountdownUrgent: boolean = false;

  @Input() stake: () => void = () => {};
  @Input() unstake: () => void = () => {};
  @Input() claim: () => void = () => {};
  @Input() connectWallet: () => void = () => {};
  @Input() disconnectWallet: () => void = () => {};
}
