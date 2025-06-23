import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/shared/footer/footer.component';
import { Links } from '../../models/links.model';
import { HeroMediaComponent } from '../../components/hero-media/hero-media.component';
import { VideoSectionComponent } from '../../components/video-section/video-section.component';
import { AudioSectionComponent } from '../../components/audio-section/audio-section.component';
import { MemesSectionComponent } from '../../components/memes-section/memes-section.component';
import { ArticlesSectionComponent } from '../../components/articles-section/articles-section.component';

@Component({
  selector: 'app-media-hall',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, HeroMediaComponent, VideoSectionComponent, AudioSectionComponent, MemesSectionComponent, ArticlesSectionComponent],
  templateUrl: './media-hall.component.html',
  styleUrl: './media-hall.component.scss'
})
export class MediaHallComponent {
  public menuItems = [
    { id: 'hero' , name: 'HOME', isActive: true},
    { id: 'videos' , name: 'VIDEOS', isActive: false},
    { id: 'podcasts', name: 'PODCASTS', isActive: false},
    { id: 'memes', name: 'MEMES', isActive: false},
    { id: 'articles', name: 'ARTICLES', isActive: false},
  ]

  public linksFooter: Array<Links> = [
    {
      placeholder: 'Home', 
      routeLink: ''
    },
    {
      placeholder: 'Real World Impact', 
      routeLink: '/rwi'
    }
  ]
}
