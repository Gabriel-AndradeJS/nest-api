import { ExecutionContext, NestInterceptor, CallHandler, Injectable } from "@nestjs/common";
import { Observable, tap } from "rxjs";

@Injectable()
export class BodyCreateTaskInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> | Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const {method, url, body} = request

        console.log(`[REQUEST] ${method} ${url}`);
        console.log(`[BODY] ${JSON.stringify(body)}`);
        
        
        return next.handle()
    }
    
}