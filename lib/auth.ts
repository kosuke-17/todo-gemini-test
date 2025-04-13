import { hash } from 'bcrypt'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { prisma } from './prisma'

/**
 * サーバーコンポーネントで現在のセッションを取得する関数
 */
export async function getSession() {
  return await getServerSession(authOptions)
}

/**
 * 現在ログインしているユーザー情報を取得する関数
 */
export async function getCurrentUser() {
  const session = await getSession()

  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return null
  }

  return {
    ...user,
    emailVerified: user.emailVerified || null,
  }
}

/**
 * ユーザー登録用の関数
 */
export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new Error('すでに登録されているメールアドレスです')
  }

  const hashedPassword = await hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  })

  return user
}

/**
 * 認証が必要なページで使用する関数
 * 未認証の場合はログインページにリダイレクト
 */
export async function requireAuth() {
  const session = await getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return session
}

/**
 * すでに認証済みの場合にリダイレクトする関数
 * ログインページなどで使用
 */
export async function redirectIfAuthenticated() {
  const session = await getSession()

  if (session) {
    redirect('/')
  }
}
