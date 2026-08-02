import { IsString, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class ApplyJobDto {
  @ApiPropertyOptional() @IsOptional() @IsString() resumeId?: string
  @ApiPropertyOptional() @IsOptional() @IsString() coverLetter?: string
}

export class UpdateApplicationStatusDto {
  @IsString() status: string
  @IsOptional() @IsString() notes?: string
}
