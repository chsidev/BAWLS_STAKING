import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MediumArticleItem } from '../../../../models/article.model';

export interface Article {
  title: string;
  imageUrl: string;
  description: string;
  date: string;
  link: string;
}

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './article-card.component.html',
  styleUrl: './article-card.component.scss'
})
export class ArticleCardComponent {
  @Input() article!: MediumArticleItem;
}
