import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { map } from "rxjs/operators";
import { getDefaultSuccessMessage } from "../constant/message";
import { RESPONSE_MESSAGE_KEY } from "../decorators/response-message.decorator";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse();
    const request = httpContext.getRequest();

    return next.handle().pipe(
      map((data) => {
        if (response?.headersSent) {
          return data;
        }

        const statusCode = response?.statusCode ?? 200;
        const customMessage = this.reflector.getAllAndOverride<string>(
          RESPONSE_MESSAGE_KEY,
          [context.getHandler(), context.getClass()],
        );

        let payload = data;
        let payloadMessage: string | undefined;

        if (
          payload &&
          typeof payload === "object" &&
          !Array.isArray(payload) &&
          "message" in payload &&
          typeof (payload as { message: unknown }).message === "string"
        ) {
          payloadMessage = (payload as { message: string }).message;
          const { message, ...rest } = payload as Record<string, unknown>;
          if (Object.keys(rest).length === 0) {
            payload = null;
          } else if (Object.keys(rest).length === 1 && "data" in rest) {
            payload = rest.data ?? null;
          } else {
            payload = rest;
          }
        }

        return {
          statusCode,
          message:
            customMessage ??
            payloadMessage ??
            getDefaultSuccessMessage(request?.method),
          data: payload ?? null,
        };
      }),
    );
  }
}
