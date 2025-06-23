import { Component, OnInit } from '@angular/core';
import { CarouselComponent } from '../shared/carousel/carousel.component';
import { ButtonComponent } from '../button/button.component';
import { CoalitionService } from '../../services/coalition.service';
import { CoalitionMember, CoalitionMembersResponse } from '../../models/coalition.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-rwi',
  standalone: true,
  imports: [CarouselComponent, ButtonComponent, RouterLink],
  templateUrl: './rwi.component.html',
  styleUrl: './rwi.component.scss'
})
export class RwiComponent implements OnInit{
  public members: CoalitionMember[] = []
  public loading = true;
  public error: string | null = null;

  constructor(private coalitionService: CoalitionService){}

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {
    this.loading = true;
    this.error = null;
    
    this.coalitionService.getMembers({ recent: true }).subscribe({
      next: (response: CoalitionMembersResponse) => {  // Properly type the response
        if (response.success) {
          this.members = response.results;  // Access the results array
        } else {
          this.error = 'Failed to load members';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading coalition members';
        this.loading = false;
        console.error(err);
      }
    });
  }

  // sample_data = [
  //   {
  //     id: '1',
  //     name: 'EcoChain',
  //     logoUrl: '/assets/logos/ecochain.png',
  //     websiteUrl: 'https://ecochain.example.com',
  //     blockchain: 'Ethereum',
  //     narrative: 'Sustainable blockchain solutions for environmental tracking and carbon credit management.',
  //     alignedOrganizations: [
  //       { name: 'Green Earth', url: 'https://greenearth.org' },
  //       { name: 'Climate Foundation', url: 'https://climatefound.org' }
  //     ]
  //   },
  //   {
  //     id: '2',
  //     name: 'HealthLedger',
  //     logoUrl: '/assets/logos/healthledger.png',
  //     websiteUrl: 'https://healthledger.example.com',
  //     blockchain: 'Polygon',
  //     narrative: 'Decentralized healthcare records system improving patient data accessibility.',
  //     alignedOrganizations: [
  //       { name: 'Global Health Org', url: 'https://globalhealth.org' }
  //     ]
  //   },
  //   // Add more members as needed...
  // ];

  // members = [...this.sample_data]
}
