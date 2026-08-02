import { IsOptional, IsString, IsEnum, IsDateString, IsUrl, IsArray, IsInt, Min, Max } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class UpdateProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() fullName?: string
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string
  @ApiPropertyOptional() @IsOptional() @IsString() avatarUrl?: string
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string
  @ApiPropertyOptional() @IsOptional() @IsString() summary?: string
  @ApiPropertyOptional() @IsOptional() @IsDateString() dob?: string
  @ApiPropertyOptional({ enum: ['MALE', 'FEMALE', 'OTHER'] })
  @IsOptional() @IsEnum(['MALE', 'FEMALE', 'OTHER']) gender?: string
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string
  @ApiPropertyOptional() @IsOptional() @IsUrl() linkedinUrl?: string
  @ApiPropertyOptional() @IsOptional() @IsUrl() githubUrl?: string
  @ApiPropertyOptional() @IsOptional() @IsUrl() portfolioUrl?: string
}

export class AddExperienceDto {
  @IsString() title: string
  @IsString() company: string
  @IsDateString() startDate: string
  @IsOptional() @IsDateString() endDate?: string
  @IsOptional() isCurrent?: boolean
  @IsOptional() @IsString() description?: string
}

export class AddEducationDto {
  @IsString() school: string
  @IsOptional() @IsString() degree?: string
  @IsOptional() @IsString() major?: string
  @IsDateString() startDate: string
  @IsOptional() @IsDateString() endDate?: string
  @IsOptional() isCurrent?: boolean
}

export class UpsertSkillsDto {
  @IsArray()
  @Type(() => SkillItem)
  skills: SkillItem[]
}

export class SkillItem {
  @IsString() skillId: string
  @IsOptional() @IsEnum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']) level?: string
}

export class UpgradePlanDto {
  @IsEnum(['PRO', 'PREMIUM']) plan: 'PRO' | 'PREMIUM'
  @IsOptional() @IsInt() @Min(1) @Max(12) months?: number
}

import { IsBoolean } from 'class-validator'

export class UpdateNotificationPrefDto {
  @IsOptional() @IsBoolean() emailApply?: boolean
  @IsOptional() @IsBoolean() emailJobAlert?: boolean
  @IsOptional() @IsBoolean() emailNews?: boolean
  @IsOptional() @IsBoolean() inAppApply?: boolean
  @IsOptional() @IsBoolean() inAppJobAlert?: boolean
  @IsOptional() @IsBoolean() inAppNews?: boolean
}
