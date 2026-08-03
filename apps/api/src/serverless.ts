import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ExpressAdapter } from '@nestjs/platform-express'
import { ValidationPipe } from '@nestjs/common'
import * as express from 'express'
import { AppServerlessModule } from './app-serverless.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import type { Request, Response } from 'express'

const expressApp = express()

const initPromise = NestFactory.create(
  AppServerlessModule,
  new ExpressAdapter(expressApp),
  { logger: process.env.NODE_ENV === 'development' ? undefined : ['error', 'warn'] },
).then(async (nestApp) => {
  nestApp.setGlobalPrefix('api/v1')
  nestApp.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  })
  nestApp.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  )
  nestApp.useGlobalFilters(new HttpExceptionFilter())
  nestApp.useGlobalInterceptors(new ResponseInterceptor())
  await nestApp.init()
})

export async function handler(req: Request, res: Response): Promise<void> {
  await initPromise
  expressApp(req as any, res as any)
}
