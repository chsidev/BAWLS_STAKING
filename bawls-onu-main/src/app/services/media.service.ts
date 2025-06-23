import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { GalleryItemsReponse } from '../models/gallery-item.model';
import { ArticlesItemsResponse } from '../models/article.model';

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  private api = inject(ApiService);
  private endpoint = 'gallery';
  private endpointArticles = 'articles';

  /**
   * Get gallery images with optional query parameters
   * @param params Optional key-value pairs for query parameters
   * @returns Observable with API response
   */
  public getImages(params?: {[key: string]: string | number | boolean}): Observable<GalleryItemsReponse> {
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

    const finalEndpoint = this.endpoint + "/images"

    return this.api.get<GalleryItemsReponse>(finalEndpoint, existParams ? params : undefined);
  }

  /**
   * Get gallery videos with optional query parameters
   * @param params Optional key-value pairs for query parameters
   * @returns Observable with API response
   */
  public getVideos(params?: {[key: string]: string | number | boolean}): Observable<GalleryItemsReponse> {
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

    const finalEndpoint = this.endpoint + "/videos"

    return this.api.get<GalleryItemsReponse>(finalEndpoint, existParams ? params : undefined);
  }

  /**
   * Get medium articles with optional query parameters
   * @param params Optional key-value pairs for query parameters
   * @returns Observable with API response
   */
  public getArticles(params?: {[key: string]: string | number | boolean}): Observable<ArticlesItemsResponse> {
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

    const finalEndpoint = this.endpointArticles

    return this.api.get<ArticlesItemsResponse>(finalEndpoint, existParams ? params : undefined);
  }

   /**
   * Get audio items with optional query parameters
   * @param params Optional key-value pairs for query parameters
   * @returns Observable with API response
   */
  public getAudio(params?: {[key: string]: string | number | boolean}): Observable<GalleryItemsReponse> {
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

    const finalEndpoint = this.endpoint + "/audio"

    return this.api.get<GalleryItemsReponse>(finalEndpoint, existParams ? params : undefined);
  }
}
