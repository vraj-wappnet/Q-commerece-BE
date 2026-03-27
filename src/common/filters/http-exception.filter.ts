import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { getDefaultErrorMessage } from "../constant/message";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    let message = getDefaultErrorMessage(statusCode);
    let errors: unknown;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === "object" && exceptionResponse) {
        const responseBody = exceptionResponse as {
          message?: string | string[];
          error?: string;
        };
        if (Array.isArray(responseBody.message)) {
          message = responseBody.message.join(", ");
          errors = responseBody.message;
        } else if (typeof responseBody.message === "string") {
          message = responseBody.message;
        } else if (typeof responseBody.error === "string") {
          message = responseBody.error;
        }
      }
    } else if (exception instanceof Error && exception.message) {
      message = exception.message;
    }

    response.status(statusCode).json({
      statusCode,
      message,
      data: null,
      ...(errors ? { errors } : {}),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
