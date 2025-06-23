export interface ApiResponse<T> {
    success: boolean;
    status: number;
    results: T[];
}