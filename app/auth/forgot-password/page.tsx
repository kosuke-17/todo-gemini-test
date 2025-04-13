import { redirectIfAuthenticated } from '@/lib/auth'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'パスワードをリセット',
  description: 'アカウントのパスワードをリセットします',
}

export default async function ForgotPasswordPage() {
  // 認証済みの場合はリダイレクト
  await redirectIfAuthenticated()

  return (
    <div className='flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-gray-900'>
          パスワードをリセット
        </h2>
        <p className='mt-2 text-center text-sm text-gray-600'>
          アカウントに登録したメールアドレスを入力してください。
          <br />
          パスワードリセット手順をメールで送信します。
        </p>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10'>
          <p className='text-center text-sm text-gray-600 mb-4'>
            この機能は現在開発中です。
            <br />
            しばらくお待ちください。
          </p>

          <div className='mt-6'>
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300' />
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='bg-white px-2 text-gray-500'>または</span>
              </div>
            </div>

            <div className='mt-6 text-center'>
              <a
                href='/auth/login'
                className='font-medium text-indigo-600 hover:text-indigo-500'
              >
                ログインページに戻る
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
