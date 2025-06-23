import { Component, HostListener, OnInit } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent implements OnInit{
  public showLeftSection = true

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  // Initial check for screen size
  ngOnInit() {
    this.checkScreenSize();
  }

  // Check the screen width and set the visibility of the left section
  checkScreenSize() {
    this.showLeftSection = window.innerWidth > 768; // Show on larger screens, hide on small
  }
}
