import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Role } from '@tuyendung/types'

export class OAuthLoginDto {
  @ApiProperty() @IsString() provider: string
  @ApiProperty() @IsString() providerId: string
  @ApiProperty() @IsEmail() email: string
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string
  @ApiPropertyOptional() @IsOptional() @IsString() avatar?: string
  @ApiPropertyOptional({ enum: Role }) @IsOptional() @IsEnum(Role) role?: Role
}
