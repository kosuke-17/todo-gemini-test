import { requireAuth, getCurrentUser } from '@/lib/auth'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'プロフィール設定',
  description: 'プロフィール情報の編集',
}

export default async function ProfileSettingsPage() {
  // 認証が必要
  await requireAuth()

  // ユーザー情報を取得
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className='text-center py-10'>
        <p className='text-red-500'>ユーザー情報の取得に失敗しました</p>
      </div>
    )
  }

  return (
    <div className='max-w-2xl mx-auto px-4 py-10'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold'>プロフィール設定</h1>
        <Link href='/profile' className='text-indigo-600 hover:text-indigo-900'>
          プロフィールに戻る
        </Link>
      </div>

      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <div className='p-6 sm:p-8'>
          <p className='text-center text-gray-600 mb-4'>
            この機能は現在開発中です。プロフィール設定の機能はまもなく実装される予定です。
          </p>

          <div className='space-y-4 mt-6'>
            <h3 className='text-lg font-medium'>将来実装予定の機能:</h3>
            <ul className='list-disc pl-5 space-y-2 text-gray-600'>
              <li>プロフィール名の変更</li>
              <li>プロフィール画像のアップロード</li>
              <li>パスワードの変更</li>
              <li>メールアドレスの変更（確認メールが送信されます）</li>
              <li>通知設定</li>
              <li>アカウントの削除</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
