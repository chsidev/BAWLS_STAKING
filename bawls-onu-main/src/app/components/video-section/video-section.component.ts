import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  VgApiService,
  VgCoreModule,
} from '@videogular/ngx-videogular/core';
import {
  VgControlsModule,
} from '@videogular/ngx-videogular/controls';
import {
  VgOverlayPlayModule,
} from '@videogular/ngx-videogular/overlay-play';
import {
  VgBufferingModule,
} from '@videogular/ngx-videogular/buffering';
import { MediaService } from '../../services/media.service';
import { GalleryItem, GalleryItemsReponse } from '../../models/gallery-item.model';

@Component({
  selector: 'app-video-section',
  standalone: true,
  imports: [
    CommonModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule
  ],
  templateUrl: './video-section.component.html',
  styleUrl: './video-section.component.scss'
})
export class VideoSectionComponent implements OnInit {
  public api!: VgApiService;
  public preload = 'auto';
  public videos: GalleryItem[] = []
  public loading = true;
  public error: string | null = null;
  public skeletonItems = Array(3).fill(0);
  public currentVideo: GalleryItem | null = null;
  
  constructor(private mediaService: MediaService){}
  
  ngOnInit(): void {
    this.loadMembers();
  }
  
  loadMembers(): void {
    this.loading = true;
    this.error = null;
    
    this.mediaService.getVideos({ recent: true }).subscribe({
      next: (response: GalleryItemsReponse) => {  // Properly type the response}        
        if (response.success) {
          this.videos = response.results;  // Access the results array
          
        } else {
          this.error = 'Failed to load members';
        }
        this.loading = false;

        this.currentVideo = this.videos[0]
      },
      error: (err) => {
        this.error = 'Error loading coalition members';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onPlayerReady(api: VgApiService): void {
    this.api = api;
    this.api.getDefaultMedia()?.subscriptions.loadedMetadata.subscribe(() => {
      // this.api.play();
    });
  }

  changeVideo(video: any): void {
    this.currentVideo = video;
    setTimeout(() => this.api.play(), 100);
  }
}