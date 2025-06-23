import { ClipboardModule } from '@angular/cdk/clipboard';
import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-wrapper',
  standalone: true,
  imports: [NgClass, ClipboardModule],
  templateUrl: './wrapper.component.html',
  styleUrl: './wrapper.component.scss'
})
export class WrapperComponent {
  @Input() type: 'clipboard' | 'actions' | 'social' = 'social';
  @Input() textToCopy: string = '';
  @Input() placeholder: string = '';
  @Input() image: string = '';
  @Input() styles: string = '';
  @Input() buttonText: string = 'Copy';
  @Input() disabled: boolean = false;
  @Input() altInfo: string = "";
  @Output() clicked = new EventEmitter<MouseEvent>();
  
  public copied = false;
  public animationState = 'in';

  public onCopy(success: boolean) {
    if (success) {
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    }
  }

  public handleClick(event: MouseEvent) {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.clicked.emit(event);
    
    // Handle clipboard case if no URL is provided
    if (this.type === 'clipboard' && !this.textToCopy) {
      event.preventDefault();
    }
  }
}
