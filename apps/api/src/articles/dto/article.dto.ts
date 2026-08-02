import { IsString, IsOptional, IsEnum, IsUrl, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export class CreateArticleDto {
  @ApiProperty() @IsString() @MinLength(5) title: string
  @ApiProperty() @IsString() @MinLength(1) content: string
  @ApiPropertyOptional() @IsOptional() @IsString() excerpt?: string
  @ApiPropertyOptional() @IsOptional() @IsString() imageUrl?: string
  @ApiProperty() @IsString() categoryId: string
  @ApiPropertyOptional({ enum: ArticleStatus })
  @IsOptional() @IsEnum(ArticleStatus) status?: ArticleStatus
  @ApiPropertyOptional() @IsOptional() @IsString() metaTitle?: string
  @ApiPropertyOptional() @IsOptional() @IsString() metaDescription?: string
  @ApiPropertyOptional() @IsOptional() @IsString() metaKeywords?: string
}

export class UpdateArticleDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(5) title?: string
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) content?: string
  @ApiPropertyOptional() @IsOptional() @IsString() excerpt?: string
  @ApiPropertyOptional() @IsOptional() @IsString() imageUrl?: string
  @ApiPropertyOptional() @IsOptional() @IsString() categoryId?: string
  @ApiPropertyOptional({ enum: ArticleStatus })
  @IsOptional() @IsEnum(ArticleStatus) status?: ArticleStatus
  @ApiPropertyOptional() @IsOptional() @IsString() metaTitle?: string
  @ApiPropertyOptional() @IsOptional() @IsString() metaDescription?: string
  @ApiPropertyOptional() @IsOptional() @IsString() metaKeywords?: string
}
