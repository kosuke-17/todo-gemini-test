'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { compare } from 'bcrypt'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { randomBytes } from 'crypto'
import { sendEmailChangeConfirmation } from '@/lib/email'

// プロフィール名変更のバリデーションスキーマ
const nameSchema = z.object({
  name: z
    .string()
    .min(2, '名前は2文字以上で入力してください')
    .max(50, '名前は50文字以下で入力してください'),
})

type ProfileNameResult = {
  success: boolean
  message?: string
  error?: string
}

// プロフィール名更新のServer Function
export async function updateProfileName(
  formData: FormData
): Promise<ProfileNameResult> {
  // 認証チェック
  const session = await getSession()
  if (!session?.user?.email) {
    return {
      success: false,
      error: '認証が必要です。ログインしてください。',
    }
  }

  try {
    // フォームデータから名前を取得
    const name = formData.get('name') as string

    // バリデーション
    const validationResult = nameSchema.safeParse({ name })
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0].message,
      }
    }

    // 現在のユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    // ユーザーが見つからない場合
    if (!user) {
      return {
        success: false,
        error: 'ユーザーが見つかりません',
      }
    }

    // 同じ名前での更新を避ける
    if (user.name === name) {
      return {
        success: false,
        error: '現在と同じ名前です',
      }
    }

    // データベース更新
    await prisma.user.update({
      where: { email: session.user.email },
      data: { name },
    })

    // キャッシュの再検証
    revalidatePath('/profile')
    revalidatePath('/profile/settings')

    return {
      success: true,
      message: 'プロフィール名を更新しました',
    }
  } catch (error) {
    console.error('プロフィール名更新エラー:', error)
    return {
      success: false,
      error: 'サーバーエラーが発生しました',
    }
  }
}

// アカウント削除のバリデーションスキーマ
const deleteAccountSchema = z.object({
  password: z.string().min(1, 'パスワードを入力してください'),
  confirmation: z.literal('delete my account', {
    errorMap: () => ({
      message: '「delete my account」と正確に入力してください',
    }),
  }),
})

type DeleteAccountResult = {
  success: boolean
  message?: string
  error?: string
}

// アカウント削除のServer Function
export async function deleteAccount(
  formData: FormData
): Promise<DeleteAccountResult> {
  // 認証チェック
  const session = await getSession()
  if (!session?.user?.email) {
    return {
      success: false,
      error: '認証が必要です。ログインしてください。',
    }
  }

  try {
    // フォームデータから値を取得
    const password = formData.get('password') as string
    const confirmation = formData.get('confirmation') as string

    // バリデーション
    const validationResult = deleteAccountSchema.safeParse({
      password,
      confirmation,
    })

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0].message,
      }
    }

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    // ユーザーが見つからない場合
    if (!user) {
      return {
        success: false,
        error: 'ユーザーが見つかりません',
      }
    }

    // パスワード検証
    if (!user.password) {
      return {
        success: false,
        error: 'パスワードが設定されていません',
      }
    }

    const isPasswordValid = await compare(password, user.password)
    if (!isPasswordValid) {
      return {
        success: false,
        error: 'パスワードが正しくありません',
      }
    }

    // トランザクションでユーザー関連データを削除
    await prisma.$transaction(async (tx) => {
      // Todoの削除
      await tx.todo.deleteMany({
        where: { userId: user.id },
      })

      // セッションの削除
      await tx.session.deleteMany({
        where: { userId: user.id },
      })

      // アカウントの削除
      await tx.account.deleteMany({
        where: { userId: user.id },
      })

      // ユーザーの削除
      await tx.user.delete({
        where: { id: user.id },
      })
    })

    // セッションクッキーを削除
    const cookiesInstance = await cookies()
    cookiesInstance.delete('next-auth.session-token')
    cookiesInstance.delete('__Secure-next-auth.session-token')

    // リダイレクト
    redirect('/')
  } catch (error) {
    console.error('アカウント削除エラー:', error)
    return {
      success: false,
      error: 'サーバーエラーが発生しました',
    }
  }
}

// メールアドレス変更リクエストのバリデーションスキーマ
const emailChangeSchema = z.object({
  password: z.string().min(1, 'パスワードを入力してください'),
  newEmail: z
    .string()
    .email('有効なメールアドレスを入力してください')
    .min(1, 'メールアドレスを入力してください'),
})

type EmailChangeResult = {
  success: boolean
  message?: string
  error?: string
}

// メールアドレス変更プロセスを開始するServer Function
export async function initiateEmailChange(
  formData: FormData
): Promise<EmailChangeResult> {
  // 認証チェック
  const session = await getSession()
  if (!session?.user?.email) {
    return {
      success: false,
      error: '認証が必要です。ログインしてください。',
    }
  }

  try {
    // フォームデータから値を取得
    const password = formData.get('password') as string
    const newEmail = formData.get('newEmail') as string

    // バリデーション
    const validationResult = emailChangeSchema.safeParse({
      password,
      newEmail,
    })

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0].message,
      }
    }

    // 現在のユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    // ユーザーが見つからない場合
    if (!user) {
      return {
        success: false,
        error: 'ユーザーが見つかりません',
      }
    }

    // 同じメールアドレスでの変更リクエストを避ける
    if (user.email === newEmail) {
      return {
        success: false,
        error: '現在と同じメールアドレスです',
      }
    }

    // 新しいメールアドレスが既に使用されているか確認
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    })

    if (existingUser) {
      return {
        success: false,
        error: 'このメールアドレスは既に使用されています',
      }
    }

    // パスワード検証
    if (!user.password) {
      return {
        success: false,
        error: 'パスワードが設定されていません',
      }
    }

    const isPasswordValid = await compare(password, user.password)
    if (!isPasswordValid) {
      return {
        success: false,
        error: 'パスワードが正しくありません',
      }
    }

    // 既存のトークンを削除（同一ユーザーによる複数リクエストを防止）
    await prisma.emailChangeToken.deleteMany({
      where: { userId: user.id },
    })

    // トークン生成
    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24時間後

    // EmailChangeTokenを保存
    await prisma.emailChangeToken.create({
      data: {
        userId: user.id,
        oldEmail: user.email || '',
        newEmail,
        token,
        expires,
      },
    })

    // 確認メールを送信
    const emailSent = await sendEmailChangeConfirmation(
      user.id,
      user.email || '',
      newEmail,
      token
    )

    if (!emailSent) {
      // メール送信に失敗した場合、トークンを削除
      await prisma.emailChangeToken.deleteMany({
        where: { token },
      })

      return {
        success: false,
        error:
          '確認メールの送信に失敗しました。しばらく経ってから再試行してください。',
      }
    }

    return {
      success: true,
      message: `${newEmail} に確認メールを送信しました。メール内のリンクをクリックして変更を完了してください。`,
    }
  } catch (error) {
    console.error('メールアドレス変更エラー:', error)
    return {
      success: false,
      error: 'サーバーエラーが発生しました',
    }
  }
}

// メールアドレス変更を確認するServer Function
export async function verifyEmailChange(
  token: string
): Promise<EmailChangeResult> {
  try {
    // トークンを検証
    const emailChangeToken = await prisma.emailChangeToken.findUnique({
      where: { token },
      include: { user: true },
    })

    // トークンが見つからない場合
    if (!emailChangeToken) {
      return {
        success: false,
        error:
          '無効なトークンです。メールアドレス変更リクエストが見つかりません。',
      }
    }

    // トークンの有効期限をチェック
    if (new Date() > emailChangeToken.expires) {
      // 期限切れのトークンを削除
      await prisma.emailChangeToken.delete({
        where: { id: emailChangeToken.id },
      })

      return {
        success: false,
        error:
          'トークンの有効期限が切れています。メールアドレス変更を再リクエストしてください。',
      }
    }

    // メールアドレスを更新
    await prisma.user.update({
      where: { id: emailChangeToken.userId },
      data: { email: emailChangeToken.newEmail },
    })

    // 使用済みトークンを削除
    await prisma.emailChangeToken.delete({
      where: { id: emailChangeToken.id },
    })

    // ユーザーセッションを無効化（再ログインを強制）
    await prisma.session.deleteMany({
      where: { userId: emailChangeToken.userId },
    })

    // セッションクッキーを削除
    const cookiesInstance = await cookies()
    cookiesInstance.delete('next-auth.session-token')
    cookiesInstance.delete('__Secure-next-auth.session-token')

    return {
      success: true,
      message:
        'メールアドレスが正常に更新されました。新しいメールアドレスでログインしてください。',
    }
  } catch (error) {
    console.error('メールアドレス確認エラー:', error)
    return {
      success: false,
      error: 'サーバーエラーが発生しました',
    }
  }
}
