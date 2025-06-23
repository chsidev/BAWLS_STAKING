import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./components/navbar/navbar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent implements OnInit {
  public title = 'bawls-onu';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Clear previous route classes
        document.body.classList.remove('home-route', 'rwi-route');
        
        // Add class based on current route
        if (event.urlAfterRedirects === '/') {
          document.body.classList.add('home-route');
        } else if (event.urlAfterRedirects.startsWith('/rwi')) {
          document.body.classList.add('rwi-route');
        }
      }
    });
  }
}
