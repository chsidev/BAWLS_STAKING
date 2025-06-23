import { Injectable } from '@angular/core';
import { PublicKey, Transaction } from '@solana/web3.js';
import { ToastrService } from 'ngx-toastr';

declare global {
  interface Window {
    solana?: any;
  }
}

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  public publicKey: PublicKey | null = null;

  constructor(private toast: ToastrService) {}
  
  async connectWallet(): Promise<any> {
    if (window.solana?.isPhantom) {
      try {
        const resp = await window.solana.connect();
        this.publicKey = new PublicKey(resp.publicKey.toString());

        this.toast.success('Connected successfully!', 'Success');
        
        const wallet = {
          publicKey: this.publicKey,
          signTransaction: window.solana.signTransaction.bind(window.solana),
          signAllTransactions: window.solana.signAllTransactions
            ? window.solana.signAllTransactions.bind(window.solana)
            : async (txs: Transaction[]) =>
                Promise.all(txs.map(window.solana.signTransaction.bind(window.solana))),
        };

        return wallet;
      } catch (err) {
        this.toast.error('Failed to connect wallet. Please try again.', 'Error');
        return null;
      }
    } else {
        this.toast.error('Phantom is not installed.', 'Error');
        return null;
    }
  }

  disconnectWallet(): void {
    window.solana?.disconnect();
    this.publicKey = null;
    this.toast.info('Wallet disconnected.', 'Info');
  }
}
