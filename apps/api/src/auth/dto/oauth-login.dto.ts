import { IsString, IsEmail, IsOptional, IsIn } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Role } from '@tuyendung/types'

/** Allowed roles for OAuth sign-up — ADMIN is never permitted via this endpoint */
const ALLOWED_OAUTH_ROLES = [Role.CANDIDATE, Role.EMPLOYER] as const

export class OAuthLoginDto {
  @ApiProperty() @IsString() provider: string
  @ApiProperty() @IsString() providerId: string
  @ApiProperty() @IsEmail() email: string
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string
  @ApiPropertyOptional() @IsOptional() @IsString() avatar?: string
  @ApiPropertyOptional({ enum: ALLOWED_OAUTH_ROLES })
  @IsOptional()
  @IsIn(ALLOWED_OAUTH_ROLES)
  role?: (typeof ALLOWED_OAUTH_ROLES)[number]
}
