import { Component } from '@angular/core';
import { CardBawlsComponent } from '../shared/card-bawls/card-bawls.component';

@Component({
  selector: 'app-bawls-cause',
  standalone: true,
  imports: [CardBawlsComponent],
  templateUrl: './bawls-cause.component.html',
  styleUrl: './bawls-cause.component.scss'
})
export class BawlsCauseComponent {
  public cardItems: Array<{ title: string, content: string, imageUrl: string, imageAlt: string }> = [
    {
      title: "#CheckyourBawls",
      content: 'Supporting men health with a focus on testicular cancer partenered with the Testicular Cancer Awareness Foundation (TCAF).',
      imageUrl: "assets/imgs/cancer_bawls.webp",
      imageAlt: "Check your Bawls"
    },
    {
      title: "#GirlzhaveBAWLS2",
      content: 'Supporting gender equality and woman empowerment.',
      imageUrl: "assets/imgs/super_girl.webp",
      imageAlt: "Super Girl BAWLS"
    },
    {
      title: "#SuperBAWLS",
      content: 'Supporting disabled heroes through Paralyzed Veterans of America (Military, law enforcement, emergency service worker).',
      imageUrl: "assets/imgs/super_bawls.webp",
      imageAlt: "Super BAWLS"
    },
  ]
}
