import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Links } from '../../../models/links.model';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  @Input({required: true}) links: Array<Links> = []

  public socialMedias = [
    {
      placeholder: "Telegram",
      URL: "https://t.me/BAWLS_OnU"
    },
    {
      placeholder: "Discord",
      URL: "https://discord.com/invite/mv2GE2edYh"
    },
    {
      placeholder: "X (Twitter)",
      URL: "https://x.com/MagicBawls"
    }
  ]

  
}
