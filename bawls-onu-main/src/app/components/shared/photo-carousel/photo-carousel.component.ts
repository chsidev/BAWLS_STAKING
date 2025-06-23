import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MediaService } from '../../../services/media.service';
import { GalleryItem, GalleryItemsReponse } from '../../../models/gallery-item.model';

@Component({
  selector: 'app-photo-carousel',
  standalone: true,
  imports: [NgClass],
  templateUrl: './photo-carousel.component.html',
  styleUrl: './photo-carousel.component.scss'
})
export class PhotoCarouselComponent {
  @Input() indicator: 'dots' | 'fraction' = 'dots'
  @Input() slides: GalleryItem[] = []

  activeIndex = 0;

  private touchStartX: number = 0;
  private touchEndX: number = 0;
  private readonly swipeThreshold: number = 50; // Min px to trigger swipe
  public loading = false;

  goToSlide(index: number): void {
    this.activeIndex = index;
  }

  nextSlide(): void {
    this.activeIndex = (this.activeIndex + 1) % this.slides.length;
  }

  prevSlide(): void {
    this.activeIndex =
      (this.activeIndex - 1 + this.slides.length) % this.slides.length;
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) > this.swipeThreshold) {
      if (diff > 0) {
        this.nextSlide(); // Swipe Left
      } else {
        this.prevSlide(); // Swipe Right
      }
    }
  }
}
