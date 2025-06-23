import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { HeroComponent } from "../../components/hero/hero.component";
import { AboutUsComponent } from '../../components/about-us/about-us.component';
import { BawlsCauseComponent } from '../../components/bawls-cause/bawls-cause.component';
import { TokenomicsComponent } from '../../components/tokenomics/tokenomics.component';
import { MemeHubComponent } from '../../components/meme-hub/meme-hub.component';
import { FaqComponent } from '../../components/faq/faq.component';
import { MarqueeComponent } from '../../components/shared/marquee/marquee.component';
import { RwiComponent } from '../../components/rwi/rwi.component';
import { BawlsListComponent } from '../../components/bawls-list/bawls-list.component';
import { FooterComponent } from '../../components/shared/footer/footer.component';
import { SeoService } from '../../services/seo.service';
import { Links } from '../../models/links.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NavbarComponent, 
    HeroComponent, 
    AboutUsComponent, 
    BawlsCauseComponent, 
    TokenomicsComponent, 
    MemeHubComponent, 
    FaqComponent,
    MarqueeComponent,
    RwiComponent,
    BawlsListComponent,
    FooterComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  public menuItems = [
    { id: 'hero' , name: 'HOME', isActive: true},
    { id: 'about', name: 'ABOUT US', isActive: false},
    { id: 'tokenomics', name: 'TOKENOMICS', isActive: false},
    { id: 'memes', name: 'MEMES', isActive: false},
    { id: 'faq', name: 'FAQ', isActive: false},
    { id: 'impact', name: 'IMPACT', isActive: false}
  ]

  public linksFooter: Array<Links> = [
    {
      placeholder: 'Real World Impact', 
      routeLink: 'rwi'
    },
    {
      placeholder: 'Media BAWLS', 
      routeLink: 'media'
    }, 
  ]

  public tags = [
    '#CheckYaBAWLS',
    '#GirlsHaveBAWLS2',
    '#SuperBAWLS',
    '#CheckYaBAWLS',
    '#CheckyourBAWLS'
  ];

  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    this.seoService.updateSeoData({
      title: '$BAWLS ONU!',
      description: 'Leading the new crypto RWI (Real World Impact) narrative creating a mega culture coin coalition transcending blockchains',
      image: 'https://bawls-onu.s3.us-east-2.amazonaws.com/media/media/bawls.png',
      url: 'https://bawlsonu.life/'
    });
  }
}
