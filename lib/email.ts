import nodemailer from 'nodemailer'

// 開発環境用のテスト設定（実際の環境ではSMTP設定を使用）
// 外部SMTPサーバーを使用する場合は、Gmailを使用すると良さそう
// AWSだとSESを使用すると良さそう
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'user@example.com',
    pass: process.env.SMTP_PASSWORD || 'password',
  },
})

// メールアドレス変更確認メールの送信
export async function sendEmailChangeConfirmation(
  userId: string,
  oldEmail: string,
  newEmail: string,
  token: string
): Promise<boolean> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`

  // メールテンプレート
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4338ca; margin-bottom: 20px;">[TodoApp] メールアドレス変更の確認</h2>
      <p>こんにちは。TodoAppをご利用いただきありがとうございます。</p>
      <p>以下のメールアドレス変更リクエストを受け付けました：</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>現在のメールアドレス:</strong> ${oldEmail}</p>
        <p><strong>新しいメールアドレス:</strong> ${newEmail}</p>
      </div>
      <p>このリクエストがあなたによるものであれば、以下のリンクをクリックして変更を完了してください：</p>
      <div style="margin: 25px 0;">
        <a href="${verificationUrl}" style="background-color: #4338ca; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          メールアドレスの変更を確認する
        </a>
      </div>
      <p>このリンクは24時間で有効期限が切れます。</p>
      <p>もしこのメールアドレス変更をリクエストしていない場合は、このメールを無視してください。アカウントのセキュリティは保たれています。</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <p style="color: #6b7280; font-size: 12px;">
        このメールはシステムによって自動送信されています。返信はできません。<br />
        何かご質問がある場合は、サポートチームにお問い合わせください。
      </p>
    </div>
  `

  try {
    await transporter.sendMail({
      from: `"TodoApp" <${process.env.SMTP_FROM || 'noreply@todoapp.com'}>`,
      to: newEmail,
      subject: '[TodoApp] メールアドレス変更の確認',
      html,
    })
    return true
  } catch (error) {
    console.error('Email sending error:', error)
    return false
  }
}
