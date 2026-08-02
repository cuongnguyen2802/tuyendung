import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Role } from '@tuyendung/types'

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string

  @ApiProperty({ example: 'Password@123' })
  @IsString()
  @MinLength(8, { message: 'Mật khẩu ít nhất 8 ký tự' })
  password: string

  @ApiProperty({ enum: [Role.CANDIDATE, Role.EMPLOYER] })
  @IsEnum([Role.CANDIDATE, Role.EMPLOYER], { message: 'Role không hợp lệ' })
  role: Role.CANDIDATE | Role.EMPLOYER

  @ApiProperty({ required: false, example: 'Nguyễn Văn A' })
  @IsOptional()
  @IsString()
  fullName?: string

  @ApiProperty({ required: false, example: 'Công ty ABC' })
  @IsOptional()
  @IsString()
  companyName?: string
}
