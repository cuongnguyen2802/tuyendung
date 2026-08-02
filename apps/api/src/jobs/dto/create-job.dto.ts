import {
  IsString, IsEnum, IsOptional, IsInt, IsBoolean,
  IsArray, IsDateString, Min, Max, MinLength,
} from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { JobType, WorkMode } from '@tuyendung/types'

export class CreateJobDto {
  @ApiProperty() @IsString() @MinLength(5) title: string
  @ApiProperty() @IsString() @MinLength(20) description: string
  @ApiPropertyOptional() @IsOptional() @IsString() requirements?: string
  @ApiPropertyOptional() @IsOptional() @IsString() benefits?: string
  @ApiProperty() @IsString() location: string
  @ApiProperty() @IsString() city: string
  @ApiProperty({ enum: JobType }) @IsEnum(JobType) jobType: JobType
  @ApiProperty({ enum: WorkMode }) @IsEnum(WorkMode) workMode: WorkMode
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) salaryMin?: number
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) salaryMax?: number
  @ApiPropertyOptional() @IsOptional() @IsBoolean() salaryNegotiable?: boolean
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(30) experienceMin?: number
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(30) experienceMax?: number
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) quantity?: number
  @ApiPropertyOptional() @IsOptional() @IsDateString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  deadline?: string

  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) skillIds?: string[]

  @ApiPropertyOptional() @IsOptional() @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  categoryId?: string
}

export class UpdateJobDto extends CreateJobDto {}

export class JobQueryDto {
  @IsOptional() @IsString() keyword?: string
  @IsOptional() @IsString() city?: string
  @IsOptional() @IsEnum(JobType) jobType?: JobType
  @IsOptional() @IsEnum(WorkMode) workMode?: WorkMode
  @IsOptional() @IsInt() @Min(0) salaryMin?: number
  @IsOptional() @IsInt() @Min(0) salaryMax?: number
  @IsOptional() @IsInt() @Min(0) experienceMin?: number
  @IsOptional() @IsArray() skills?: string[]
  @IsOptional() @IsString() industry?: string
  @IsOptional() @IsString() categorySlug?: string
  @IsOptional() @IsString() sortBy?: 'newest' | 'salary' | 'views'
  @IsOptional() @IsInt() @Min(1) page?: number
  @IsOptional() @IsInt() @Min(1) @Max(100) limit?: number
}
