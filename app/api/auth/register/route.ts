import { NextRequest, NextResponse } from 'next/server'
import { registerUser } from '@/lib/auth'
import { z } from 'zod'
import { validateCsrfToken } from '@/lib/csrf'

// バリデーションスキーマ
const userSchema = z.object({
  name: z.string().min(2, { message: '名前は2文字以上で入力してください' }),
  email: z
    .string()
    .email({ message: '有効なメールアドレスを入力してください' }),
  password: z
    .string()
    .min(8, { message: 'パスワードは8文字以上で入力してください' }),
})

export async function POST(request: NextRequest) {
  try {
    // CSRFトークンの検証
    if (!validateCsrfToken(request)) {
      return NextResponse.json(
        { error: 'CSRFトークンが無効です' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // バリデーション
    const result = userSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, password } = result.data

    // ユーザー登録処理
    await registerUser(name, email, password)

    return NextResponse.json(
      { message: 'ユーザーが正常に登録されました' },
      { status: 201 }
    )
  } catch (error) {
    console.error('登録エラー:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'ユーザー登録中に問題が発生しました' },
      { status: 500 }
    )
  }
}
