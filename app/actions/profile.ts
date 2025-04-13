'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { compare } from 'bcrypt'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

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
    cookies().delete('next-auth.session-token')
    cookies().delete('__Secure-next-auth.session-token')

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
