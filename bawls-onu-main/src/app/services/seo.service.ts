import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';


interface SeoData {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {}

  updateSeoData(seoData: SeoData) {
    // Set document title
    this.titleService.setTitle(seoData.title);

    // Basic meta tags
    this.metaService.updateTag({ name: 'description', content: seoData.description });
    this.metaService.updateTag({ property: 'og:title', content: seoData.title });
    this.metaService.updateTag({ property: 'og:description', content: seoData.description });
    
    if (seoData.image) {
      this.metaService.updateTag({ property: 'og:image', content: seoData.image });
      this.metaService.updateTag({ name: 'twitter:image', content: seoData.image });
    }

    if (seoData.url) {
      this.metaService.updateTag({ property: 'og:url', content: seoData.url });
      this.updateCanonicalUrl(seoData.url);
    }

    // Twitter meta
    this.metaService.updateTag({ name: 'twitter:title', content: seoData.title });
    this.metaService.updateTag({ name: 'twitter:description', content: seoData.description });
  }

  updateCanonicalUrl(url: string) {
    let link: HTMLLinkElement | null = this.document.querySelector(`link[rel='canonical']`) || null;

    if (link) {
      link.setAttribute('href', url);
    } else {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', url);
      this.document.head.appendChild(link);
    }
  }
}
