import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { Article, ArticleCardComponent } from './article-card/article-card.component';
import { ArticlesItemsResponse, MediumArticleItem } from '../../../models/article.model';
import { MediaService } from '../../../services/media.service';


@Component({
  selector: 'app-article-carousel',
  standalone: true,
  imports: [ArticleCardComponent],
  templateUrl: './article-carousel.component.html',
  styleUrl: './article-carousel.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ArticleCarouselComponent implements AfterViewInit, OnInit{
  @ViewChild('carousel', { static: false }) carouselRef!: ElementRef<HTMLDivElement>;

  private touchStartX = 0;
  public articles: MediumArticleItem[] = [];
  public loading = true;
  public error: string | null = null;
  public currentIndex = signal(0);

  constructor(private mediaService: MediaService){}
  

  ngAfterViewInit(): void {
    setInterval(() => {
      if (window.innerWidth >= 1024) return;
      this.scrollTo(this.currentIndex() + 1);
    }, 6000);
  }

  ngOnInit(): void {
    this.loadArticles();
  }

  public loadArticles(): void {
    this.loading = true;
    this.error = null;

    this.mediaService.getArticles({ recents: true }).subscribe({
      next: (response: ArticlesItemsResponse) => {
        if (response.success) {
          this.articles = response.results;
        } else {
          this.error = "Failed to load articles"
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error fetching the medium articles'
        console.error(err)
      },
      complete: () => {
        this.loading = false;
      }
    })
  }

  scrollTo(index: number) {
    const container = this.carouselRef.nativeElement;
    const itemWidth = container.querySelector('.carousel-item')?.clientWidth ?? 0;
    const maxIndex = this.articles.length - 1;
    const nextIndex = index < 0 ? maxIndex : index > maxIndex ? 0 : index;

    this.currentIndex.set(nextIndex);

    const scrollLeft = itemWidth * nextIndex;
    container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  }

  onTouchStart(e: TouchEvent) {
    this.touchStartX = e.touches[0].clientX;
  }

  onTouchEnd(e: TouchEvent) {
    const deltaX = e.changedTouches[0].clientX - this.touchStartX;
    if (Math.abs(deltaX) < 50) return;

    deltaX < 0 ? this.scrollTo(this.currentIndex() + 1) : this.scrollTo(this.currentIndex() - 1);
  }
}
