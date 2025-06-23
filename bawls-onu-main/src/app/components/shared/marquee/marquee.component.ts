import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-marquee',
  standalone: true,
  imports: [],
  templateUrl: './marquee.component.html',
  styleUrl: './marquee.component.scss'
})
export class MarqueeComponent implements OnInit {
  @Input({required: true}) tags: Array<string> = []
  @Input() background: string = "bg-blue-faq"

  public imageUrl = 'assets/imgs/icon.svg'; 
  public duplicatedItems: (string | null)[] = []

  ngOnInit(): void {
    this.duplicatedItems = this.createDuplicatedItems()
  }

  private createDuplicatedItems(): (string | null)[] {
    const items: (string | null)[] = [];

    this.tags.forEach(tag => {
      items.push(tag);
      items.push(null); // null represents image position
    });
    return [...items, ...items]; // duplicate for looping
  }
}
