import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { WalletService } from '../../services/wallet.service';
import { AnchorService } from '../../services/anchor.service';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
// @ts-ignore
import { BN } from 'bn.js';

@Component({
  selector: 'app-stake',
  standalone: true,
  imports: [FormsModule, CommonModule, NavbarComponent],
  templateUrl: './stake.component.html',
  styleUrl: './stake.component.scss',
})
export class StakeComponent {
  constructor(
    public walletService: WalletService,
    private anchorService: AnchorService
  ) {}

  stakeAmount = 0;
  userStake = 0;
  rewards = 0;

  get walletAddress(): string | null {
    return this.walletService.publicKey?.toBase58() ?? null;
  }

  async connectWallet() {
    const wallet = await this.walletService.connectWallet();
    if (wallet) {
      await this.anchorService.init(wallet);
    }
  }

  async stake() {
    if (!this.walletService.publicKey) {
      const wallet = await this.walletService.connectWallet();
      if (!wallet) return;
      await this.anchorService.init(wallet);
    }

    const user = this.walletService.publicKey!;
    const mint = new PublicKey('DxUTmqRt49dNsKwM1kzrquMpKsnyMGEpGKeZg1YfUdgJ');
    const { config, pool, userState, vault, from } = await this.anchorService.getPDAs(user, mint);

    try {
      const userStateAccount = await this.anchorService.connection.getAccountInfo(userState);
      if (!userStateAccount) {
        console.log("Creating user state...");
        const tx = await this.anchorService.program.methods
          ['initializeUserState']()
          .accounts({
            userState,
            user,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        console.log("User state initialized:", tx);
      } else {
        console.log("User state already exists, skipping initialization.");
      }

      const txSig = await this.anchorService.program.methods
        ['stake'](new BN(this.stakeAmount))
        .accounts({
          userState,
          authority: user,
          config,
          pool,
          user,
          from,
          vault,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      console.log('Stake tx:', txSig);
    } catch (e) {
      console.error('Stake failed:', e);
    }
  }

  disconnectWallet(): void {
    this.walletService.disconnectWallet();
  }

  unstake() {
    console.log('Unstaking...');
  }

  claim() {
    console.log('Claiming rewards...');
  }
}
