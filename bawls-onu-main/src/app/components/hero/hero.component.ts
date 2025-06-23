import { AfterViewInit, Component, HostListener } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements AfterViewInit {
  ngAfterViewInit() {
    this.setupPerfectCircle();
  }
  
  private setupPerfectCircle() {
    const textPath = document.querySelector('textPath');
    if (!textPath) return;
  
    // Calculate circumference (2πr)
    const radius = 200;
    const circumference = 2 * Math.PI * radius;
    
    // Set SVG attributes programmatically
    textPath.setAttribute('textLength', circumference.toString());
    textPath.setAttribute('lengthAdjust', 'spacingAndGlyphs');
    
    // Dynamically adjust text repetitions
    const baseText = " DON'T YOU LOVE • BAWLS ONU • ";
    const textWidth = this.estimateTextWidth(baseText);
    const repetitions = Math.ceil(circumference / textWidth);
    textPath.textContent = baseText.repeat(repetitions ); // +1 buffer
  }
  
  private estimateTextWidth(text: string): number {
    // Approximate 15px per character (adjust based on your font)
    return text.length * 15;
  }
}