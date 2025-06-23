import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import {ClipboardModule} from '@angular/cdk/clipboard';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-tokenomics',
  standalone: true,
  imports: [ DecimalPipe, ClipboardModule, ButtonComponent],
  templateUrl: './tokenomics.component.html',
  styleUrl: './tokenomics.component.scss'
})
export class TokenomicsComponent {
  public totalBawls = 999979300.05
  public bawlsAddressBank = "Cd3XVDGohMUTSm3LC7eXYAtZDsF8FnxbdbBaTSSUQM2"
  public avaxBawlsAddress = "0x2da8312e2c08b79104c6b18ba26bc7065abec704"
  public solanaBawlsAddress = "GAFQP8vSdDsHcjbBapN794CNEp5Wo6scqSDMSzDHpump"
}
