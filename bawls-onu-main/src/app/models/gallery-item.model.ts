import { ApiResponse } from './api-response.model';
import { Media } from './coalition.model';  // Reuse your existing Media interface

export interface GalleryItem {
  title: string;
  file: Media;
  author?: string;
  logoUrl?: string | null;
  thumbnail?: Media;
  media_type: 'image' | 'video' | 'audio';  // You added this in the serializer
  created_at: string;
  updated_at: string;
}

export type GalleryItemsReponse = ApiResponse<GalleryItem>;