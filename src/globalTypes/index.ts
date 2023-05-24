export interface HttpResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: string[];
  status?: number;
}
