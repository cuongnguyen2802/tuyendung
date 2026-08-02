import { IsOptional, IsString, IsUrl, IsEnum, IsInt, Min, Max } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { CompanySize } from '@tuyendung/types'

export class UpdateCompanyDto {
  @ApiPropertyOptional() @IsOptional() @IsString() companyName?: string
  @ApiPropertyOptional() @IsOptional() @IsString() logoUrl?: string
  @ApiPropertyOptional() @IsOptional() @IsString() coverUrl?: string
  @ApiPropertyOptional() @IsOptional() @IsUrl() website?: string
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string
  @ApiPropertyOptional({ enum: CompanySize }) @IsOptional() @IsEnum(CompanySize) size?: CompanySize
  @ApiPropertyOptional() @IsOptional() @IsString() industry?: string
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1800) @Max(new Date().getFullYear()) founded?: number
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string
  @ApiPropertyOptional() @IsOptional() @IsString() country?: string
  @ApiPropertyOptional() @IsOptional() @IsString() taxCode?: string
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string
  @ApiPropertyOptional() @IsOptional() @IsString() facebookUrl?: string
  @ApiPropertyOptional() @IsOptional() @IsString() linkedinUrl?: string
}
