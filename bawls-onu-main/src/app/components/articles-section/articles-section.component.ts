import { Component } from '@angular/core';
import { ArticleCarouselComponent } from '../shared/article-carousel/article-carousel.component';

@Component({
  selector: 'app-articles-section',
  standalone: true,
  imports: [ArticleCarouselComponent],
  templateUrl: './articles-section.component.html',
  styleUrl: './articles-section.component.scss'
})
export class ArticlesSectionComponent {

}
