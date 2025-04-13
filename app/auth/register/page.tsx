import { redirectIfAuthenticated } from '@/lib/auth'
import AuthForm from '@/app/components/AuthForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'アカウント登録',
  description: '新しいアカウントを作成してTodoを管理しましょう',
}

interface RegisterPageProps {
  searchParams: {
    callbackUrl?: string
  }
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  // 認証済みの場合はリダイレクト
  await redirectIfAuthenticated()

  return <AuthForm type='register' callbackUrl={searchParams.callbackUrl} />
}
