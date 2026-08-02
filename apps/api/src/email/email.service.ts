import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private readonly logger = new Logger(EmailService.name)
  private readonly from: string

  constructor(private config: ConfigService) {
    const host = config.get<string>('SMTP_HOST')
    this.from = config.get<string>('SMTP_FROM', 'TuyenDung.vn <noreply@tuyendung.vn>')

    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: config.get<number>('SMTP_PORT', 587),
        secure: config.get<boolean>('SMTP_SECURE', false),
        auth: {
          user: config.get<string>('SMTP_USER'),
          pass: config.get<string>('SMTP_PASS'),
        },
      })
      this.logger.log('Email service initialized')
    } else {
      this.logger.warn('SMTP_HOST not set, email sending disabled')
    }
  }

  async sendMail(to: string, subject: string, html: string) {
    if (!this.transporter) return
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html })
      this.logger.log(`Email sent to ${to}: ${subject}`)
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${err}`)
    }
  }

  async sendApplicationReceived(to: string, candidateName: string, jobTitle: string, companyName: string) {
    await this.sendMail(
      to,
      `[TuyenDung.vn] Đơn ứng tuyển "${jobTitle}" đã được nhận`,
      `<h2>Xin chào ${candidateName},</h2>
       <p>Đơn ứng tuyển của bạn cho vị trí <strong>${jobTitle}</strong> tại <strong>${companyName}</strong> đã được ghi nhận.</p>
       <p>Chúng tôi sẽ thông báo kết quả trong thời gian sớm nhất.</p>
       <br/><p>Chúc bạn may mắn!</p>
       <p><strong>TuyenDung.vn</strong></p>`,
    )
  }

  async sendApplicationStatusChanged(
    to: string,
    candidateName: string,
    jobTitle: string,
    status: string,
    link: string,
  ) {
    const statusMap: Record<string, string> = {
      REVIEWING: 'đang được xem xét',
      INTERVIEW: 'được mời phỏng vấn',
      OFFER: 'nhận được offer',
      REJECTED: 'không phù hợp lần này',
    }
    await this.sendMail(
      to,
      `[TuyenDung.vn] Cập nhật đơn ứng tuyển "${jobTitle}"`,
      `<h2>Xin chào ${candidateName},</h2>
       <p>Đơn ứng tuyển của bạn cho vị trí <strong>${jobTitle}</strong> đã được cập nhật:</p>
       <p><strong>Trạng thái: ${statusMap[status] || status}</strong></p>
       <br/><a href="${link}" style="background:#00b14f;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">Xem chi tiết</a>
       <br/><br/><p><strong>TuyenDung.vn</strong></p>`,
    )
  }

  async sendJobAlertEmail(
    to: string,
    name: string,
    total: number,
    jobs: Array<{ title: string; company: string; city: string; slug: string }>,
  ) {
    const BASE = process.env.NEXT_PUBLIC_WEB_URL ?? 'https://tuyendung.vn'
    const rows = jobs
      .map(
        j => `<tr>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0">
            <a href="${BASE}/jobs/${j.slug}" style="font-weight:bold;color:#00b14f;text-decoration:none">${j.title}</a><br/>
            <span style="color:#888;font-size:13px">${j.company} · ${j.city}</span>
          </td></tr>`,
      )
      .join('')

    await this.sendMail(
      to,
      `[TuyenDung.vn] ${total} việc làm mới phù hợp với bạn`,
      `<div style="font-family:Arial,sans-serif;max-width:540px;margin:auto">
        <h2 style="color:#00b14f">Xin chào ${name},</h2>
        <p>Có <strong>${total} việc làm mới</strong> phù hợp với tiêu chí tìm kiếm của bạn:</p>
        <table style="width:100%;border-collapse:collapse">${rows}</table>
        <br/><a href="${BASE}/jobs" style="background:#00b14f;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold">Xem tất cả việc làm</a>
        <br/><br/>
        <p style="color:#aaa;font-size:12px">Bạn nhận email này vì đã đăng ký thông báo việc làm trên TuyenDung.vn.<br/>
        <a href="${BASE}/settings/job-alerts" style="color:#aaa">Quản lý thông báo</a></p>
      </div>`,
    )
  }

  async sendJobInvitation(to: string, candidateName: string, jobTitle: string, companyName: string, link: string) {
    await this.sendMail(
      to,
      `[TuyenDung.vn] ${companyName} mời bạn ứng tuyển "${jobTitle}"`,
      `<h2>Xin chào ${candidateName},</h2>
       <p><strong>${companyName}</strong> muốn mời bạn ứng tuyển vị trí <strong>${jobTitle}</strong>.</p>
       <br/><a href="${link}" style="background:#00b14f;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">Xem tin tuyển dụng</a>
       <br/><br/><p><strong>TuyenDung.vn</strong></p>`,
    )
  }

  async sendPasswordReset(to: string, name: string, resetUrl: string) {
    await this.sendMail(
      to,
      '[TuyenDung.vn] Đặt lại mật khẩu',
      `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
        <h2 style="color:#00b14f">Đặt lại mật khẩu</h2>
        <p>Xin chào <strong>${name}</strong>,</p>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${to}</strong>.</p>
        <p>Nhấn nút bên dưới để đặt lại mật khẩu. Link có hiệu lực trong <strong>15 phút</strong>.</p>
        <br/>
        <a href="${resetUrl}" style="display:inline-block;background:#00b14f;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold">Đặt lại mật khẩu</a>
        <br/><br/>
        <p style="color:#888;font-size:13px">Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
        <hr style="border:none;border-top:1px solid #eee"/>
        <p style="color:#aaa;font-size:12px">TuyenDung.vn — Kết nối tài năng &amp; cơ hội</p>
      </div>`,
    )
  }

  async sendEmailVerification(to: string, name: string, verifyUrl: string) {
    await this.sendMail(
      to,
      '[TuyenDung.vn] Xác thực địa chỉ email',
      `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
        <h2 style="color:#00b14f">Xác thực email của bạn</h2>
        <p>Xin chào <strong>${name}</strong>,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại TuyenDung.vn!</p>
        <p>Vui lòng nhấn nút bên dưới để xác thực địa chỉ email. Link có hiệu lực trong <strong>24 giờ</strong>.</p>
        <br/>
        <a href="${verifyUrl}" style="display:inline-block;background:#00b14f;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold">Xác thực email</a>
        <br/><br/>
        <p style="color:#888;font-size:13px">Nếu bạn không tạo tài khoản này, hãy bỏ qua email.</p>
        <hr style="border:none;border-top:1px solid #eee"/>
        <p style="color:#aaa;font-size:12px">TuyenDung.vn — Kết nối tài năng &amp; cơ hội</p>
      </div>`,
    )
  }
}
