import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'rwi',
        loadComponent: () => import('./pages/real-world-impact/real-world-impact.component').then(m => m.RealWorldImpactComponent )
    },
    {
        path: 'media',
        loadComponent: () => import('./pages/media-hall/media-hall.component').then(m => m.MediaHallComponent )
    },
    {
        path: 'stake',
        loadComponent: () =>
            import('./pages/stake/stake.component').then((m) => m.StakeComponent),
    },
    {
      path: '**',
      component: NotFoundComponent
    }
];
