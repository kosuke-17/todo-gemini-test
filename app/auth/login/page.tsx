import { redirectIfAuthenticated } from '@/lib/auth'
import AuthForm from '@/app/components/AuthForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ログイン',
  description: 'アカウントにログインしてTodoを管理しましょう',
}

interface LoginPageProps {
  searchParams: {
    callbackUrl?: string
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // 認証済みの場合はリダイレクト
  await redirectIfAuthenticated()

  return <AuthForm type='login' callbackUrl={searchParams.callbackUrl} />
}
