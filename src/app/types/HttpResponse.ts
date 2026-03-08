export interface HttpResponse<T> {
    success: boolean;
    data: T;
    message: string;
}