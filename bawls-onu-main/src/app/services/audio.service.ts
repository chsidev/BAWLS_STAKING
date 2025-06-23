import { Injectable } from '@angular/core';
import { Howl } from 'howler';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private player?: Howl;
  public currentUrl: string | null = null;
  public isPlaying = false;
  public currentTitle: string = '';
  public currentTime: number = 0;
  public duration: number = 0;

  private updateInterval?: any;

  play(url: string, title: string) {
    if (this.currentUrl === url && this.player?.playing()) {
      this.pause();
      return;
    }

    if (this.player) {
      this.player.stop();
      clearInterval(this.updateInterval);
    }

    this.player = new Howl({
      src: [url],
      html5: true,
      onplay: () => {
        this.isPlaying = true;
        this.duration = this.player?.duration() || 0;
        this.updateInterval = setInterval(() => {
          this.currentTime = this.player?.seek() as number;
        }, 500);
      },
      onend: () => {
        this.isPlaying = false;
        this.currentTime = 0;
        clearInterval(this.updateInterval);
      },
    });

    this.player.play();
    this.isPlaying = true;
    this.currentUrl = url;
    this.currentTitle = title;
  }

  pause() {
    this.player?.pause();
    this.isPlaying = false;
  }

  stop() {
    this.player?.stop();
    this.isPlaying = false;
    this.currentUrl = null;
    this.currentTitle = '';
    this.currentTime = 0;
    clearInterval(this.updateInterval);
  }

  get progress(): number {
    return this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
  }
}
