import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { validateCsrfToken } from '@/lib/csrf'

// 認証が必要なパス
const protectedPaths = [
  '/profile',
  // 追加の保護されたパスをここに追加
]

// 認証済みユーザーにリダイレクトするパス
const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password']

// CSRF検証が必要なAPI
const csrfProtectedRoutes = [
  '/api/auth/register',
  '/api/auth/callback/credentials', // Next-Authのログイン処理
  // 他のCSRF保護が必要なエンドポイント
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method

  // CSRF保護が必要なAPIへのPOSTリクエストをチェック
  if (
    method === 'POST' &&
    csrfProtectedRoutes.some((route) => pathname.startsWith(route))
  ) {
    // CSRFトークンを検証
    if (!validateCsrfToken(request)) {
      return NextResponse.json(
        { error: 'CSRF検証に失敗しました' },
        { status: 403 }
      )
    }
  }

  // 認証トークンを取得
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // 認証が必要なページへのアクセスチェック
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  )

  if (isProtectedPath && !token) {
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('callbackUrl', encodeURI(pathname))
    return NextResponse.redirect(url)
  }

  // 認証済みユーザーの認証ページへのアクセスチェック
  const isAuthRoute = authRoutes.some((path) => pathname.startsWith(path))

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api routes that don't require auth
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)',
    '/api/auth/register',
  ],
}
