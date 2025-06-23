import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service'
import { CoalitionMembersResponse } from '../models/coalition.model';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class CoalitionService {
  private api = inject(ApiService);
  private endpoint = 'coallitions';

  /**
   * Get coalition members with optional query parameters
   * @param params Optional key-value pairs for query parameters
   * @returns Observable with API response
   */
  public getMembers(params?: {[key: string]: string | number | boolean}): Observable<CoalitionMembersResponse> {
    // Create HttpParams correctly
    const existParams = params && Object.keys(params).length > 0

    let httpParams = new HttpParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.append(key, value.toString());
        }
      });
    }

    return this.api.get<CoalitionMembersResponse>(this.endpoint, existParams ? params : undefined);
  }

  // createMember(member: CoalitionMember): Observable<CoalitionMember> {
  //   return this.api.post<CoalitionMember>(this.endpoint, member);
  // }
}