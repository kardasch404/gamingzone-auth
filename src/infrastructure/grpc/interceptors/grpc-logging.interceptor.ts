import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class GrpcLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const rpcContext = context.switchToRpc();
    const methodName = context.getHandler().name;
    const data = rpcContext.getData();

    console.log(`[gRPC] ${methodName} - Request:`, JSON.stringify(data));
    const now = Date.now();

    return next.handle().pipe(
      tap(response => {
        console.log(`[gRPC] ${methodName} - Response (${Date.now() - now}ms):`, JSON.stringify(response));
      }),
    );
  }
}
