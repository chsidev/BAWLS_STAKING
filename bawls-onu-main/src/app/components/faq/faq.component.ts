import { Component } from '@angular/core';
import { AccordionComponent } from '../shared/accordion/accordion.component';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [AccordionComponent],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent {

  public accordionItems = [
    {
      title: 'What is Bawls Onu?',
      content: "BAWLS ONU ($BAWLS) is a meme-powered movement driving real-world impact (RWI). Built on AVAX and Solana, we unite communities through humor while championing men's health, supporting disabled heroes, and advocating for gender equality. With nonprofit partnerships, NFT collections, and game integration, BAWLS isn’t just a coin—it’s a culture."
      ,
      isExpanded: false
    },
    {
      title: 'Why us?',
      content: "Because $BAWLS isn't just another memecoin. We're a values-driven movement combining humor, culture, and crypto to drive real-world impact. While others chase hype, we’re building community, supporting real causes, and turning laughs into action. Whether you're here for the memes, the mission, or the moon—$BAWLS gives you a reason to care and a reason to HODL.\n Join us, and put your BAWLS where your heart is.",
      isExpanded: false
    },
    {
      title: 'Where to buy?',
      content: 'You can buy $BAWLS on both Solana and Avalanche (AVAX) networks.\n Make sure you’re using the official contract address to avoid fake tokens. Always DYOR—and hold your BAWLS tight.',
      isExpanded: false
    },
    {
      title: 'What is RWI',
      content: `RWI stands for Real World Impact — a movement in Web3 focused on using blockchain technology and community power to make a real difference in the world. RWI projects aim to create positive social change by offering real utility, raising awareness for important causes, or supporting fundraising efforts. The goal is to connect digital innovation with real-life action and impact.
      `,
      isExpanded: false
    },
    {
      title: 'What is the BAWLS Community Bank (BCB)?',
      content: `The BAWLS Community Bank is a multi-signature wallet managed by trusted members of the community. It’s used to safely hold and distribute funds for:<br>
        • Donations to partnered charities
        • Funding community-led development initiatives
        • Supporting real-world impact (RWI) projects<br>
        It’s all about transparency, accountability, and collective action—giving the community a direct hand in how $BAWLS creates change.
      `,
      isExpanded: false
    }
  ];

  public onItemToggled(index: number) {

  }
}
