import { ApiResponse } from "./api-response.model";

// src/app/models/coalition.model.ts
export interface CoalitionMember {
    id: string;
    name: string;
    logoUrl: string;
    websiteUrl: string;
    thumbnail: Media;
    blockchain: string;
    narrative: string;
    created_at: string;
    updated_at: string;
}

export interface Media {
    id: string;
    url: string | null;
    order: number;
    name: string;
    file: string | null;
    size: string | null;
    type: string | null;
    key: string | null;
    media_type: 'image' | 'video' | 'document' | 'audio';
    created_at: string;
    updated_at: string;
}

// Specific type for your coalition members response
export type CoalitionMembersResponse = ApiResponse<CoalitionMember>;