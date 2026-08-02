import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter')

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`[${request.method} ${request.url}] ${(exception as Error)?.message}`, (exception as Error)?.stack)
    }

    const message =
      exception instanceof HttpException
        ? (exception.getResponse() as { message?: string | string[] }).message ||
          exception.message
        : (exception as Error)?.message || 'Internal server error'

    response.status(status).json({
      success: false,
      error: HttpStatus[status] || 'UNKNOWN_ERROR',
      message: Array.isArray(message) ? message[0] : message,
      path: request.url,
      timestamp: new Date().toISOString(),
    })
  }
}
