import { IsString, IsOptional, MinLength, MaxLength, IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class ChatHistoryItemDto {
  @IsString()
  role: 'user' | 'assistant'

  @IsString()
  content: string
}

export class ChatMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  message: string

  /** Existing session ID — omit to start a fresh session */
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  sessionId?: string

  /** Browser-generated UUID for anonymous users (stored in localStorage) */
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  guestId?: string
}
