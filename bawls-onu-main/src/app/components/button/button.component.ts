import { ClipboardModule } from '@angular/cdk/clipboard';
import { Component, Input } from '@angular/core';
import { WrapperComponent } from './wrapper/wrapper.component';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [ ClipboardModule, WrapperComponent],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() URL: string = '';
  @Input() type: 'clipboard' | 'actions' | 'social' = 'social';
  @Input() textToCopy: string = '';
  @Input() placeholder: string = '';
  @Input() image: string = '';
  @Input() styles: string = '';
  @Input() buttonText: string = '';
  @Input() disabled: boolean = false;
  @Input() altInfo: string = "";

  handleButtonClick(event: MouseEvent) {
    // Custom click handling logic if needed
    // console.log('Button clicked', event);
  }
}
