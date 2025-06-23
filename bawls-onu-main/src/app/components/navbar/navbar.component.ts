import { AfterViewInit, Component, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ClickOutsideDirective, NgClass, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements AfterViewInit, OnDestroy {
  @Input() menuItems: Array<{ id: string, name:string, isActive:boolean }> = []
  @ViewChild(ClickOutsideDirective) clickOutsideDir!: ClickOutsideDirective;
  private sections: HTMLElement[] = [];
  private scrollTimeout: any;

  public isMenuOpen = false;

  ngAfterViewInit() {
    setTimeout(() => {
      this.sections = this.menuItems
        .map(item => document.getElementById(item.id))
        .filter(Boolean) as HTMLElement[];
      this.checkActiveSection(); // Initial check
    }, 300);
  }

  @HostListener('window:scroll')
  onScroll() {
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.checkActiveSection();
    }, 100);
  }

  private checkActiveSection() {
    if (!this.sections.length) return;

    const scrollPosition = window.scrollY + (window.innerHeight / 3);
    let activeSection: string | null = null;

    // Check from bottom to top for better upward scroll detection
    for (let i = this.sections.length - 1; i >= 0; i--) {
      const section = this.sections[i];
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        activeSection = section.id;
        break;
      }
    }

    // Fallback: Find nearest section if none is fully in view
    if (!activeSection) {
      activeSection = this.findNearestSection(scrollPosition);
    }

    this.updateActiveMenu(activeSection);
  }

  private findNearestSection(scrollPosition: number): string {
    let closestSection = this.sections[0].id;
    let smallestDistance = Math.abs(this.sections[0].offsetTop - scrollPosition);

    this.sections.forEach(section => {
      const distance = Math.abs(section.offsetTop - scrollPosition);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestSection = section.id;
      }
    });

    return closestSection;
  }

  private updateActiveMenu(activeId: string | null) {
    this.menuItems.forEach(item => {
      item.isActive = item.id === activeId;
    });
  }

  scrollToSection(sectionId: string) {
    const section = document.getElementById(sectionId);
    if (section) {
      const headerHeight = document.querySelector('header')?.clientHeight || 0;
      const targetPosition = section.offsetTop - headerHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      // Force update active state
      this.updateActiveMenu(sectionId);
    }
  }


  public toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      setTimeout(() => this.clickOutsideDir.startListening());
    } else {
      this.clickOutsideDir.stopListening();
    }
  }

  public closeMenu() {
    this.isMenuOpen = false;
    this.clickOutsideDir.stopListening();
  }

  ngOnDestroy(): void {
    clearTimeout(this.scrollTimeout);
  }

}
