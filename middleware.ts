import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// 認証が必要なパス
const protectedPaths = [
  '/profile',
  // 追加の保護されたパスをここに追加
]

// 認証済みユーザーにリダイレクトするパス
const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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
  ],
}
