import { requireAuth, getCurrentUser } from '@/lib/auth'
import { Metadata } from 'next'
import Link from 'next/link'
import UpdateNameForm from '@/app/components/profile/UpdateNameForm'
import UpdateEmailForm from '@/app/components/profile/UpdateEmailForm'
import DeleteAccountForm from '@/app/components/profile/DeleteAccountForm'

export const metadata: Metadata = {
  title: 'プロフィール設定',
  description: 'アカウント情報の管理',
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
    <div className='max-w-3xl mx-auto px-4 py-8'>
      <div className='flex items-center justify-between mb-8'>
        <h1 className='text-2xl font-bold'>プロフィール設定</h1>
        <Link
          href='/profile'
          className='text-indigo-600 hover:text-indigo-900 font-medium'
        >
          ← プロフィールに戻る
        </Link>
      </div>

      <div className='space-y-8'>
        <section id='basic-info'>
          <h2 className='text-xl font-semibold mb-4'>基本情報</h2>
          <div className='space-y-6'>
            <UpdateNameForm user={user} />
            <UpdateEmailForm user={user} />
          </div>
        </section>

        <section id='danger-zone'>
          <h2 className='text-xl font-semibold text-red-600 mb-4'>
            危険ゾーン
          </h2>
          <DeleteAccountForm />
        </section>
      </div>
    </div>
  )
}
