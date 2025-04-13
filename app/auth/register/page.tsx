import { redirectIfAuthenticated } from '@/lib/auth'
import AuthForm from '@/app/components/AuthForm'
import { Metadata } from 'next'
import { generateCsrfToken } from '@/lib/csrf'

export const metadata: Metadata = {
  title: '新規登録',
  description: 'アカウントを作成してTodoを管理しましょう',
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

  // CSRFトークンを生成
  const csrfToken = generateCsrfToken()

  return (
    <AuthForm
      type='register'
      callbackUrl={searchParams.callbackUrl}
      csrfToken={csrfToken}
    />
  )
}
