import { Component, OnInit } from '@angular/core';
import { AudioPlayerComponent } from "../audio-player/audio-player.component";
import { MediaService } from '../../services/media.service';
import { GalleryItem, GalleryItemsReponse } from '../../models/gallery-item.model';

@Component({
  selector: 'app-audio-section',
  standalone: true,
  imports: [AudioPlayerComponent],
  templateUrl: './audio-section.component.html',
  styleUrl: './audio-section.component.scss'
})
export class AudioSectionComponent implements OnInit {
  public audios: GalleryItem[] = []
  public error: string | null = null;
  public loading: boolean = true;
  
  constructor(private mediaService: MediaService){}
    
  
  ngOnInit(): void {
    this.loadAudios();
  }

  public loadAudios(): void {
      this.loading = true;
          this.error = null;
          
          this.mediaService.getAudio({ recent: true }).subscribe({
            next: (response: GalleryItemsReponse) => {       
              if (response.success) {
                this.audios = response.results;  
                
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
