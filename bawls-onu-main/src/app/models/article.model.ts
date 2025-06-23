import { ApiResponse } from './api-response.model';

export interface MediumArticleItem {
  title: string;
  link: string;
  published: string;
  summary: string;
  thumbnail: string;
}

export type ArticlesItemsResponse = ApiResponse<MediumArticleItem>;