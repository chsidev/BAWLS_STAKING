import { NgClass } from '@angular/common';
import { Component, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Howl, Howler } from 'howler';
import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';
import { GalleryItem } from '../../models/gallery-item.model';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  imports: [ NgClass ],
  styleUrls: ['./audio-player.component.scss'],
  animations: [
    trigger('playlistToggle', [
      state('visible', style({ height: '*', opacity: 1, overflow: 'hidden' })),
      state('hidden', style({ height: '0px', opacity: 0, overflow: 'hidden' })),
      transition('visible <=> hidden', animate('300ms ease-in-out')),
    ]),
     trigger('chevronRotate', [
      state('expanded', style({ transform: 'rotate(180deg)' })),
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      transition('expanded <=> collapsed', animate('200ms ease')),
    ])
  ],
  standalone: true
})
export class AudioPlayerComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) playlist: GalleryItem[] = []

  public loading = false;
  public currentTrackIndex = 0;
  public currentTrack!: GalleryItem
  public player!: Howl;
  public isPlaying = false;
  public isShuffling = false;
  public isRepeating = false;
  public currentTime = 0;
  public duration = 0;
  public interval: any;
  public volume = 1; // default full volume
  public isMuted = false;
  public previousVolume = 1;
  public showVolumeSlider = false;
  public isPlaylistVisible = true;

  ngOnChanges(changes: SimpleChanges): void {
    const changesPlaylist: Array<GalleryItem> = changes['playlist'].currentValue
    
    if (changesPlaylist.length > 0){
      this.currentTrack = this.playlist[this.currentTrackIndex];
      this.initPlayer(this.currentTrack)
    }
    
  }

  ngOnDestroy(): void {
    this.clearTimer();
    if (this.player) {
      this.player.unload();
    }
  }

  initPlayer(track: GalleryItem): void {
    if (this.player) {
      this.player.unload();
    }

    this.player = new Howl({
      src: [track.file.file ?? ''],
      html5: true,
      onplay: () => {
        this.isPlaying = true;
        this.duration = Math.floor(this.player.duration());
        this.startTimer();
      },
      onpause: () => {
        this.isPlaying = false;
        this.clearTimer();
      },
      onend: () => {
        this.clearTimer();
        this.isPlaying = false;
        if (this.isRepeating) {
          this.play();
        } else {
          this.playNext();
        }
      }
    });
    this.player.volume(this.volume);
    // this.play();
  }

  play(): void {
    this.player.play();
  }

  pause(): void {
    this.player.pause();
  }

  togglePlayPause(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  playNext(): void {
    if (this.isShuffling) {
      this.currentTrackIndex = Math.floor(Math.random() * this.playlist.length);
    } else {
      this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
    }
    this.currentTrack = this.playlist[this.currentTrackIndex];
    this.initPlayer(this.currentTrack);
  }

  playPrevious(): void {
    this.currentTrackIndex =
      (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
    this.currentTrack = this.playlist[this.currentTrackIndex];
    this.initPlayer(this.currentTrack);
  }

  toggleShuffle(): void {
    this.isShuffling = !this.isShuffling;
  }

  toggleRepeat(): void {
    this.isRepeating = !this.isRepeating;
  }

  selectTrack(track: GalleryItem): void {
    this.currentTrackIndex = this.playlist.indexOf(track);
    this.currentTrack = track;
    this.initPlayer(track);
  }

  seekTo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);
    this.player.seek(value);
    this.currentTime = value;
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${this.padZero(m)}:${this.padZero(s)}`;
  }

  private padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  private startTimer(): void {
    this.clearTimer();
    this.interval = setInterval(() => {
      this.currentTime = Math.floor(this.player.seek() as number);
    }, 500);
  }

  private clearTimer(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  
  changeVolume(event: Event): void {
    const input = event.target as HTMLInputElement;
    const vol = parseFloat(input.value);
    this.volume = vol;
    this.isMuted = vol === 0;
    Howler.volume(vol);
  }

  toggleMute(): void {
    if (this.isMuted) {
      this.volume = this.previousVolume || 1;
      Howler.volume(this.volume);
      this.isMuted = false;
    } else {
      this.previousVolume = this.volume;
      this.volume = 0;
      Howler.volume(0);
      this.isMuted = true;
    }
  }

  toggleVolumeSlider(): void {
    this.showVolumeSlider = !this.showVolumeSlider;
  }

  togglePlaylist() {
    this.isPlaylistVisible = !this.isPlaylistVisible;
  }

}
