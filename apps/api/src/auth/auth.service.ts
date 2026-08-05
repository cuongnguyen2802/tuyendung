import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { PrismaService } from '../prisma/prisma.service'
import { EmailService } from '../email/email.service'
import { ActivityService } from '../activity/activity.service'
import { Role, JwtPayload, AuthTokens } from '@tuyendung/types'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { OAuthLoginDto } from './dto/oauth-login.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private email: EmailService,
    private activity: ActivityService,
  ) {}

  // ─── Forgot / Reset password ──────────────────────────────────────────────

  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } })
    // Always return success to prevent email enumeration
    if (!user || !user.isActive) return

    const token = nanoid(48)
    const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpires: expires },
    })

    const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000')
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`
    const name = await this.getUserDisplayName(user.id)
    await this.email.sendPasswordReset(email, name, resetUrl)
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() },
      },
    })
    if (!user) throw new BadRequestException('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn')

    const hashed = await bcrypt.hash(newPassword, 10)
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    })
    // Revoke all refresh tokens after password change
    await this.prisma.refreshToken.deleteMany({ where: { userId: user.id } })
  }

  // ─── Email verification ───────────────────────────────────────────────────

  async sendEmailVerification(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.emailVerified) return

    const token = nanoid(48)
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerToken: token, emailVerExpires: expires },
    })

    const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000')
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`
    const name = await this.getUserDisplayName(userId)
    await this.email.sendEmailVerification(user.email, name, verifyUrl)
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerToken: token,
        emailVerExpires: { gt: new Date() },
      },
    })
    if (!user) throw new BadRequestException('Link xác thực không hợp lệ hoặc đã hết hạn')

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerToken: null, emailVerExpires: null },
    })
  }

  async resendVerification(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user || user.emailVerified) return
    await this.sendEmailVerification(user.id)
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.password) throw new BadRequestException('Tài khoản không hỗ trợ đổi mật khẩu')

    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) throw new BadRequestException('Mật khẩu hiện tại không đúng')

    const hashed = await bcrypt.hash(newPassword, 10)
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } })
    // Revoke all refresh tokens to force re-login on other devices
    await this.prisma.refreshToken.deleteMany({ where: { userId } })
  }

  // ─── Helper ───────────────────────────────────────────────────────────────

  private async getUserDisplayName(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        profile: { select: { fullName: true } },
        employer: { select: { companyName: true } },
      },
    })
    return user?.profile?.fullName || user?.employer?.companyName || user?.email.split('@')[0] || 'bạn'
  }

  async register(dto: RegisterDto): Promise<AuthTokens> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (existing) throw new ConflictException('Email đã được sử dụng')

    if (dto.role === Role.EMPLOYER && !dto.companyName) {
      throw new BadRequestException('Vui lòng nhập tên công ty')
    }

    const hashed = await bcrypt.hash(dto.password, 10)
    const slug = dto.companyName
      ? this.toSlug(dto.companyName) + '-' + nanoid(6)
      : undefined

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashed,
          role: dto.role,
          ...(dto.role === Role.CANDIDATE && {
            profile: {
              create: { fullName: dto.fullName || dto.email.split('@')[0] },
            },
          }),
          ...(dto.role === Role.EMPLOYER && {
            employer: {
              create: {
                companyName: dto.companyName!,
                slug: slug!,
              },
            },
          }),
        },
      })

      // Send verification email asynchronously (don't block registration)
      this.sendEmailVerification(user.id).catch(() => {})

      return this.generateTokens(user.id, user.email, user.role as Role)
    } catch (err: any) {
      console.error('[register] Prisma error:', err?.code, err?.message, err?.meta)
      if (err?.code === 'P2002') {
        throw new ConflictException('Email hoặc thông tin công ty đã tồn tại')
      }
      throw new BadRequestException(err?.message || 'Không thể tạo tài khoản, vui lòng thử lại')
    }
  }

  async oauthLogin(dto: OAuthLoginDto): Promise<AuthTokens> {
    let user = await this.prisma.user.findFirst({
      where: { provider: dto.provider, providerId: dto.providerId },
    })

    if (!user) {
      const existing = await this.prisma.user.findUnique({ where: { email: dto.email } })
      if (existing) {
        user = await this.prisma.user.update({
          where: { id: existing.id },
          data: { provider: dto.provider, providerId: dto.providerId },
        })
      } else {
        const role = dto.role ?? Role.CANDIDATE
        user = await this.prisma.user.create({
          data: {
            email: dto.email,
            provider: dto.provider,
            providerId: dto.providerId,
            role,
            emailVerified: true,
            ...(role === Role.CANDIDATE && {
              profile: {
                create: {
                  fullName: dto.name || dto.email.split('@')[0],
                  avatarUrl: dto.avatar,
                },
              },
            }),
          },
        })
      }
    }

    if (!user.isActive) throw new UnauthorizedException('Tài khoản đã bị khóa')

    if (user.role === Role.EMPLOYER) {
      this.logEmployerLogin(user.id, user.email)
    }

    return this.generateTokens(user.id, user.email, user.role as Role)
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (!user || !user.password) throw new UnauthorizedException('Email hoặc mật khẩu không đúng')
    if (!user.isActive) throw new UnauthorizedException('Tài khoản đã bị khóa')

    const valid = await bcrypt.compare(dto.password, user.password)
    if (!valid) throw new UnauthorizedException('Email hoặc mật khẩu không đúng')

    if (user.role === Role.EMPLOYER) {
      this.logEmployerLogin(user.id, user.email)
    }

    return this.generateTokens(user.id, user.email, user.role as Role)
  }

  async refreshTokens(token: string): Promise<AuthTokens> {
    const stored = await this.prisma.refreshToken.findUnique({ where: { token } })
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn')
    }

    const user = await this.prisma.user.findUnique({ where: { id: stored.userId } })
    if (!user || !user.isActive) throw new UnauthorizedException('Tài khoản không tồn tại')

    await this.prisma.refreshToken.delete({ where: { token } })
    return this.generateTokens(user.id, user.email, user.role as Role)
  }

  async logout(token: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { token } })
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        profile: { select: { fullName: true, avatarUrl: true, title: true } },
        employer: { select: { companyName: true, logoUrl: true, slug: true } },
      },
    })
    return user
  }

  /** Fire-and-forget: look up employer.id then write a LOGIN activity log */
  private logEmployerLogin(userId: string, email: string) {
    this.prisma.employer.findUnique({ where: { userId }, select: { id: true } })
      .then((employer) => {
        if (!employer) return
        return this.activity.record(
          employer.id,
          'LOGIN',
          `Đăng nhập vào hệ thống (${email})`,
          userId,
          email,
        )
      })
      .catch(() => {})
  }

  private async generateTokens(userId: string, email: string, role: Role): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: userId, email, role }

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '1h'),
    })

    const refreshToken = nanoid(64)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await this.prisma.refreshToken.create({
      data: { userId, token: refreshToken, expiresAt },
    })

    return { accessToken, refreshToken }
  }

  private toSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()
  }
}
