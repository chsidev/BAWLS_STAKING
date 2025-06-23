import { Component, OnInit } from '@angular/core';
import { PhotoCarouselComponent } from '../shared/photo-carousel/photo-carousel.component';
import { GalleryItem, GalleryItemsReponse } from '../../models/gallery-item.model';
import { MediaService } from '../../services/media.service';

@Component({
  selector: 'app-memes-section',
  standalone: true,
  imports: [PhotoCarouselComponent],
  templateUrl: './memes-section.component.html',
  styleUrl: './memes-section.component.scss'
})
export class MemesSectionComponent implements OnInit {
  public images: GalleryItem[] = []
  public error: string | null = null;
  public loading: boolean = true;
  
  constructor(private mediaService: MediaService){}
    
  
  ngOnInit(): void {
    this.loadPhotos();
  }

  public loadPhotos(): void {
    this.loading = true;
        this.error = null;
        
        this.mediaService.getImages({ latest: true }).subscribe({
          next: (response: GalleryItemsReponse) => {  // Properly type the response}        
            if (response.success) {
              this.images = response.results;  // Access the results array
              
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
