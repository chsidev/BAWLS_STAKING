import { afterNextRender, AfterViewInit, Component, computed, ElementRef, Input, OnChanges, OnDestroy, signal, SimpleChanges } from '@angular/core';
import { CoalitionMember } from '../../../models/coalition.model';
import { NgClass } from '@angular/common';


@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [NgClass],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss'
})
export class CarouselComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) members: CoalitionMember[] = [];
  public currentIndex = signal(0);
  public visibleItems = signal(3); // Now using a signal
  public touchStartX = 0;
  public touchEndX = 0;
  public isDragging = false;
  public dragOffset = 0;
  public activeDotIndex = computed(() => Math.floor(this.currentIndex() / this.visibleItems()));
  public totalSlides = computed(() => Math.ceil(this.members.length / this.visibleItems()));
  public activeSlide = signal(0);
  public loading = true;


  // Responsive settings
  private responsiveSettings = [
    { maxWidth: 639, items: 1 },
    { maxWidth: 1023, items: 2 },
    { maxWidth: Infinity, items: 3 }
  ];

  constructor(private el: ElementRef) {
    this.updateVisibleItems();
    window.addEventListener('resize', this.handleResize.bind(this));

    afterNextRender(() => {
      this.setupTouchEvents();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['members']){
      if ((changes['members'].currentValue as Array<Object>).length > 0){
        this.loading = false
      }
    }
    
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.handleResize.bind(this));
    this.cleanupTouchEvents();
  }

  private setupTouchEvents() {
    const carousel = this.el.nativeElement.querySelector('.carousel-track');
    if (carousel) {
      carousel.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
      carousel.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
      carousel.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }
  }

  private cleanupTouchEvents() {
    const carousel = this.el.nativeElement.querySelector('.carousel-track');
    if (carousel) {
      carousel.removeEventListener('touchstart', this.handleTouchStart.bind(this));
      carousel.removeEventListener('touchmove', this.handleTouchMove.bind(this));
      carousel.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    }
  }

  private handleResize() {
    this.updateVisibleItems();
  }

  private updateVisibleItems() {
    const width = window.innerWidth;
    const setting = this.responsiveSettings.find(s => width <= s.maxWidth) || this.responsiveSettings[2];
    this.visibleItems.set(setting.items);
    this.currentIndex.set(Math.min(this.currentIndex(), this.maxIndex()));
  }

  // Touch event handlers
  private handleTouchStart(e: TouchEvent) {
    this.touchStartX = e.touches[0].clientX;
    this.isDragging = true;
  }

  private handleTouchMove(e: TouchEvent) {
    if (!this.isDragging) return;
    e.preventDefault();
    this.touchEndX = e.touches[0].clientX;
    this.dragOffset = this.touchEndX - this.touchStartX;
  }

  private handleTouchEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    
    const threshold = 50;
    if (this.dragOffset > threshold) {
      this.prev();
    } else if (this.dragOffset < -threshold) {
      this.next();
    }
    this.dragOffset = 0;
  }

  public next() {
    const newIndex = this.currentIndex() + this.visibleItems();
    if (newIndex < this.members.length) {
      this.currentIndex.set(newIndex);
      this.activeSlide.set(Math.floor(newIndex / this.visibleItems()));
    }
  }
  
  public prev() {
    const newIndex = this.currentIndex() - this.visibleItems();
    if (newIndex >= 0) {
      this.currentIndex.set(newIndex);
      this.activeSlide.set(Math.floor(newIndex / this.visibleItems()));
    }
  }

  get transformValue() {
    const percentage = -(this.currentIndex() * (100 / this.visibleItems())) + (this.dragOffset / window.innerWidth * 100);
    return `translateX(${percentage}%)`;
  }

  get visibleMembers() {
    return this.members.slice(this.currentIndex(), this.currentIndex() + this.visibleItems());
  }

  public goToMember(dotIndex: number) {
    this.currentIndex.set(dotIndex * this.visibleItems());
  }

  public goToSlide(slideIndex: number) {
    const newIndex = slideIndex * this.visibleItems();
    this.currentIndex.set(newIndex);
    this.activeSlide.set(slideIndex);
  }

  private maxIndex(): number {
    return Math.max(0, this.members.length - this.visibleItems());
  }

  public getDots(): number[] {
    return Array.from({length: this.totalSlides()}, (_, i) => i);
  }
}
