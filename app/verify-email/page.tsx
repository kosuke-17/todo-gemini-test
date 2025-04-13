import { verifyEmailChange } from '@/app/actions/profile'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'メールアドレス変更の確認',
  description: 'メールアドレスの変更を完了する',
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  // トークンがない場合
  if (!searchParams.token) {
    return (
      <div className='max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md'>
        <h1 className='text-xl font-bold text-red-600 mb-4'>エラー</h1>
        <p className='text-gray-700 mb-4'>
          無効なリクエストです。トークンが見つかりません。
        </p>
        <Link
          href='/profile/settings'
          className='text-indigo-600 hover:text-indigo-800'
        >
          プロフィール設定に戻る
        </Link>
      </div>
    )
  }

  // トークンを検証
  const result = await verifyEmailChange(searchParams.token)

  if (result.success) {
    return (
      <div className='max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md'>
        <h1 className='text-xl font-bold text-green-600 mb-4'>
          メールアドレスの変更が完了しました
        </h1>
        <p className='text-gray-700 mb-6'>{result.message}</p>
        <Link
          href='/login'
          className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        >
          ログインページへ
        </Link>
      </div>
    )
  } else {
    return (
      <div className='max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md'>
        <h1 className='text-xl font-bold text-red-600 mb-4'>
          エラーが発生しました
        </h1>
        <p className='text-gray-700 mb-4'>{result.error}</p>
        <Link
          href='/profile/settings'
          className='text-indigo-600 hover:text-indigo-800'
        >
          プロフィール設定に戻る
        </Link>
      </div>
    )
  }
}
