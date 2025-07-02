// src/app/core/api/api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';

/**
 * Interfaces matching backend models
 */

export interface HistoryEntry {
  wallet: string;
  type: 'stake' | 'unstake' | 'claim';
  amount: number;
  timestamp: Date;
  txHash: string;

  displayType?: string; 
}

export interface NewHistoryEntry {
  wallet: string;
  type: 'stake' | 'unstake' | 'claim';
  amount: number;
  txHash: string;
}

export interface LeaderboardEntry {
  rank: number;
  wallet: string;
  amount: number;
  daysStaked: number;
  badge: string; 
}

export interface Badge {
  level: string;
  daysRequired: number;
}

/**
 * ApiService
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }  

  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }

  
  /**
   * Generic GET method with optional query params
   */
  get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Observable<T> {
    // Convert params to HttpParams correctly
    let httpParams = new HttpParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, {
      params: httpParams,
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Generic POST method
   */
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, body, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }
  
  // ----------------------------------------------------
  // Named API Methods matching backend Express routes
  // ----------------------------------------------------

  /** Get all history (admin view) */
  getAllHistory(): Observable<HistoryEntry[]> {
    return this.get<HistoryEntry[]>('history');
  }

  /** Get history for one wallet */
  getUserHistory(wallet: string): Observable<HistoryEntry[]> {
    return this.get<HistoryEntry[]>(`history/${wallet}`);
  }

  /** Add a new history entry (stake/unstake/claim) */
  addHistoryEntry(entry: NewHistoryEntry): Observable<{ success: boolean }> {
    return this.post<{ success: boolean }>('history', entry);
  }

  /** Get leaderboard data */
  getLeaderboard(): Observable<LeaderboardEntry[]> {
    return this.get<LeaderboardEntry[]>('leaderboard');
  }

  /** Get badge data */
  getBadges(): Observable<Badge[]> {
    return this.get<Badge[]>('badges');
  }
}