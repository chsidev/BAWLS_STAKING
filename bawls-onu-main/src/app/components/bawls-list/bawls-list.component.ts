import { Component } from '@angular/core';

@Component({
  selector: 'app-bawls-list',
  standalone: true,
  imports: [],
  templateUrl: './bawls-list.component.html',
  styleUrl: './bawls-list.component.scss'
})
export class BawlsListComponent {
  public items = [
    "Memes with impact - Laugh, Hold, Change the World",
    "Crypto with BAWLS - Supporting Health & Equality",
    "Cross-Chain Power – Built on AVAX & Solana",
    "Gaming & NFT Ecosystem – More than just a token",
    "Fair Launch, No Presale – 100% Transparency",
    "Real-World Impact (RWI) – Your BAWLS, Your Legacy",
    "Laugh, Buy, Make a Difference"
  ]
}
