import { Component, HostListener, Input, OnInit, computed} from '@angular/core';
import { NgOptimizedImage, NgStyle } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

type BentoContent = 
  | { type: 'text'; data: string }
  | { type: 'image'; data: string; alt?: string; modalData?: any }
  | { type: 'component'; component: any; inputs?: Record<string, any> }
  | { type: 'video'; data: string; thumbnail?: string; modalData?: any } ;

  // TODO: Hacer modelo e interfaz para el backend para que no esten mamando
export interface BentoGridItem {
  id: string | number;
  title?: string;
  content: BentoContent;
  cols: number;
  rows: number;
  customClass?: string;
}

type ModalContent = (
  | { 
      type: 'image'; 
      data: string; 
      alt?: string; 
      caption?: string;
      thumbnail?: never;  // Explicitly set to never for image type
    }
  | { 
      type: 'video'; 
      data: string; 
      thumbnail?: string; 
      caption?: string;
      alt?: never;  // Explicitly set to never for video type
    }
);

@Component({
  selector: 'app-bento-grid',
  standalone: true,
  imports: [NgOptimizedImage, NgStyle],
  templateUrl: './bento-grid.component.html',
  styleUrl: './bento-grid.component.scss',
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
      ]),
      transition('* => *', [
        animate('200ms ease-out')
      ])
    ]),
    trigger('backdropAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class BentoGridComponent implements OnInit {
  @Input({ required: true }) items: BentoGridItem[] = [];
  @Input() gap = '4';
  @Input() maxColumns = 4;
  @Input() rowHeight = '180px';
  
  showModal = false;
  modalContent: ModalContent | null = null;
  animationState = 'void';
  currentColumns = this.maxColumns;
  gridStyle: Record<string, string> = {};
  isMobile = false;
  isTablet = false;

  ngOnInit(): void {
    this.updateResponsiveLayout();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.updateResponsiveLayout();
  }

  private updateResponsiveLayout() {
    const width = window.innerWidth;
    this.isMobile = width < 640;
    this.isTablet = width >= 640 && width < 1024;
    
    if (this.isMobile) {
      this.currentColumns = 2;
    } else if (this.isTablet) {
      this.currentColumns = 2;
    } else {
      this.currentColumns = this.maxColumns;
    }

    this.updateGridLayout();
  }

  private updateGridLayout() {
    this.gridStyle = {
      'display': 'grid',
      'grid-template-columns': `repeat(${this.currentColumns}, minmax(0, 1fr))`,
      'gap': `${this.gap}px`,
      'grid-auto-rows': this.rowHeight,
      'grid-auto-flow': 'dense'
    };
  }

  getItemColSpan(item: BentoGridItem): string {
    if (this.isMobile) {
      // On mobile, make 2-col items full width and 1-col items half width
      return item.cols === 2 ? 'span 2' : 'span 1';
    }
    return `span ${item.cols}`;
  }

  getItemRowSpan(item: BentoGridItem): string {
    if (this.isMobile) {
      // On mobile, maintain similar proportions
      return `span ${item.rows}`;
    }
    return `span ${item.rows}`;
  }

  
  // Compute grid template columns
  gridTemplateColumns = computed(() => 
    `repeat(${this.maxColumns}, minmax(0, 1fr))`
  );

  openModal(content: BentoContent) {
    if (content.type === 'image') {
      this.modalContent = {
        type: 'image',
        data: content.data,
        alt: content.alt,
        caption: content.modalData?.caption
      };
    } else if (content.type === 'video') {
      this.modalContent = {
        type: 'video',
        data: content.data,
        caption: content.modalData?.caption
      };
    }
    
    this.showModal = true;
    document.body.classList.add('overflow-hidden');
  }

  closeModal() {
    this.showModal = false;
    document.body.classList.remove('overflow-hidden');
    this.modalContent = null;
  }
}