import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

export interface AccordionItem {
  title: string;
  content: string;
  isExpanded?: boolean;
}

@Component({
  selector: 'app-accordion',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatIconModule],
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.scss'
})
export class AccordionComponent {
  @Input() items: AccordionItem[] = [];
  @Input() icon: string = "assets/imgs/question_circle.svg"
  @Input() altIcon: string = "Question mark inside a circle"
  @Input() multiExpand = false;
  @Input() borderColor = 'blue-500';
  @Output() itemToggled = new EventEmitter<number>();

  constructor(private sanitizer: DomSanitizer){}

  public toggleItem(index: number): void {
    if (!this.multiExpand) {
      this.items.forEach((item, i) => {
        item.isExpanded = i === index ? !item.isExpanded : false;
      });
    } else {
      this.items[index].isExpanded = !this.items[index].isExpanded;
    }
    this.itemToggled.emit(index);
  }

  public formatContent(content: string) {
    // Replace newlines with <br> and add bullet points
    const formatted = content
      .replace(/\n/g, '<br>')
      .replace(/\•/g, '•'); // Preserve bullet points if already in text
    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }
}
