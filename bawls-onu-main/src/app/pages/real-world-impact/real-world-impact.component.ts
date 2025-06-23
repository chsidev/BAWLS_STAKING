import { Component } from '@angular/core';
import { MarqueeComponent } from '../../components/shared/marquee/marquee.component';
import { CoalitionMember, CoalitionMembersResponse } from '../../models/coalition.model';
import { CoalitionService } from '../../services/coalition.service';
import { FooterComponent } from '../../components/shared/footer/footer.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { SeoService } from '../../services/seo.service';
import { Links } from '../../models/links.model';

@Component({
  selector: 'app-real-world-impact',
  standalone: true,
  imports: [MarqueeComponent, FooterComponent],
  templateUrl: './real-world-impact.component.html',
  styleUrl: './real-world-impact.component.scss',
  animations: [
    trigger('fadeInAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})

export class RealWorldImpactComponent {

  public linksFooter: Array<Links> = [
    {
      placeholder: 'Home', 
      routeLink: ''
    }, 
    {
      placeholder: 'Media BAWLS', 
      routeLink: '/media'
    }, 
  ]

  public tags = [
    '#Bravery',
    '#Awareness',
    '#Wellbeing',
    '#Laughter',
    '#SocialGood'
  ];

  public members: CoalitionMember[] = []
  public loading = true;
  public error: string | null = null;
  public skeletonItems = Array(8).fill(0);

  constructor(private coalitionService: CoalitionService, private seoService: SeoService){}

  ngOnInit(): void {
    this.loadMembers();

    this.seoService.updateSeoData({
      title: '$BAWLS ONU!',
      description: 'Leading the new crypto RWI (Real World Impact) narrative creating a mega culture coin coalition transcending blockchains',
      image: 'https://bawls-onu.s3.us-east-2.amazonaws.com/media/media/bawls.png',
      url: 'https://bawlsonu.life/'
    });
  }

  loadMembers(): void {
    this.loading = true;
    this.error = null;
    
    this.coalitionService.getMembers().subscribe({
      next: (response: CoalitionMembersResponse) => {  // Properly type the response
        if (response.success) {
          this.members = response.results;  // Access the results array
        } else {
          this.error = 'Failed to load members';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading coalition members';
        this.loading = false;
        console.error(err);
      }
    });
  }

}
