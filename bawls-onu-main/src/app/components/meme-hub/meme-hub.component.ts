import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PhotoCarouselComponent } from '../shared/photo-carousel/photo-carousel.component';
import { ButtonComponent } from '../button/button.component';
import { GalleryItem, GalleryItemsReponse } from '../../models/gallery-item.model';
import { MediaService } from '../../services/media.service';

@Component({
  selector: 'app-meme-hub',
  standalone: true,
  imports: [PhotoCarouselComponent, ButtonComponent, RouterLink],
  templateUrl: './meme-hub.component.html',
  styleUrl: './meme-hub.component.scss'
})
export class MemeHubComponent implements OnInit{
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
          
          this.mediaService.getImages({ recent: true }).subscribe({
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
