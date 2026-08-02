import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateCampaignDto {
  @ApiProperty() @IsString() @MinLength(3) name: string
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string
  @ApiPropertyOptional() @IsNumber() @IsOptional() budget?: number
  @ApiProperty() @IsDateString() startDate: string
  @ApiProperty() @IsDateString() endDate: string
}

export class UpdateCampaignDto {
  @ApiPropertyOptional() @IsString() @IsOptional() name?: string
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string
  @ApiPropertyOptional() @IsNumber() @IsOptional() budget?: number
  @ApiPropertyOptional() @IsDateString() @IsOptional() startDate?: string
  @ApiPropertyOptional() @IsDateString() @IsOptional() endDate?: string
  @ApiPropertyOptional() @IsEnum(['ACTIVE', 'PAUSED', 'ENDED']) @IsOptional() status?: string
}
