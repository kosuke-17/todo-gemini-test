import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const CSRF_TOKEN_COOKIE = 'csrf_token'
const CSRF_TOKEN_HEADER = 'x-csrf-token'
const TOKEN_EXPIRY = 60 * 60 // 1時間（秒単位）

/**
 * CSRFトークンを生成し、クッキーに保存する
 */
export async function generateCsrfToken(): Promise<string> {
  try {
    const token = randomBytes(32).toString('hex')

    // cookiesを取得
    const cookieStore = await cookies()

    // 新しいトークンをクッキーに設定
    cookieStore.set(CSRF_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: TOKEN_EXPIRY,
      path: '/',
    })

    return token
  } catch (error) {
    console.error('CSRF token generation error:', error)
    return randomBytes(32).toString('hex') // エラー時も一意のトークンを返す
  }
}

/**
 * リクエストからCSRFトークンを取得し、クッキーに保存されたトークンと比較する
 */
export function validateCsrfToken(request: NextRequest): boolean {
  const cookieTokenStore = request.cookies.get(CSRF_TOKEN_COOKIE)
  const cookieToken = cookieTokenStore?.value

  // ヘッダーからトークンを取得
  const headerToken = request.headers.get(CSRF_TOKEN_HEADER)

  // トークンが存在するかチェック
  if (!cookieToken || !headerToken) {
    return false
  }

  // トークンが一致するかチェック
  return cookieToken === headerToken
}

/**
 * フォームデータからCSRFトークンを検証
 */
export async function validateCsrfTokenFromFormData(
  formData: FormData
): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const cookieToken = cookieStore.get(CSRF_TOKEN_COOKIE)?.value

    // フォームデータからトークンを取得
    const formToken = formData.get('csrf_token') as string

    // トークンが存在するかチェック
    if (!cookieToken || !formToken) {
      return false
    }

    // トークンが一致するかチェック
    return cookieToken === formToken
  } catch (error) {
    console.error('CSRF token validation error:', error)
    return false
  }
}
