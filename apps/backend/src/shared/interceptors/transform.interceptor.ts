import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IApiResponse } from '../../common/interfaces/response.interface';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, IApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<IApiResponse<T>> {
    return next.handle().pipe(
      map((data: any) => {
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          return {
            success: data.success !== undefined ? data.success : true,
            data: data.data !== undefined ? data.data : data,
            message: data.message || '',
            ...data,
          };
        }
        return {
          success: true,
          data,
          message: '',
        };
      }),
    );
  }
}
