import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-bawls',
  standalone: true,
  imports: [],
  templateUrl: './card-bawls.component.html',
  styleUrl: './card-bawls.component.scss'
})
export class CardBawlsComponent {
  @Input({required: true }) title = "";
  @Input({required: true }) content = "";
  @Input({required: true }) imageUrl = "";
  @Input({required: true }) imageAlt = "";
}
