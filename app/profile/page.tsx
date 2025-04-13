import { requireAuth, getCurrentUser } from '@/lib/auth'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'プロフィール',
  description: 'あなたのプロフィール情報',
}

export default async function ProfilePage() {
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

  // ユーザーのTodos統計情報を取得
  const todosStats = await prisma.todo.groupBy({
    by: ['completed'],
    where: {
      userId: user.id,
    },
    _count: {
      id: true,
    },
  })

  const completedCount = todosStats.find((stat) => stat.completed)
    ? todosStats.find((stat) => stat.completed)?._count.id || 0
    : 0

  const incompleteCount = todosStats.find((stat) => !stat.completed)
    ? todosStats.find((stat) => !stat.completed)?._count.id || 0
    : 0

  const totalCount = completedCount + incompleteCount

  return (
    <div className='max-w-2xl mx-auto px-4 py-10'>
      <h1 className='text-2xl font-bold mb-6'>プロフィール</h1>

      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <div className='p-6 sm:p-8'>
          <div className='flex flex-col sm:flex-row items-center sm:items-start gap-6'>
            <div className='shrink-0'>
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || 'プロフィール画像'}
                  width={100}
                  height={100}
                  className='rounded-full'
                />
              ) : (
                <div className='w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center'>
                  <span className='text-indigo-800 font-medium text-2xl'>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
            </div>

            <div className='flex-1 text-center sm:text-left'>
              <h2 className='text-xl font-semibold'>
                {user.name || 'ユーザー'}
              </h2>
              <p className='text-gray-600 mt-1'>{user.email}</p>

              <div className='mt-4 space-y-2'>
                <div>
                  <span className='text-gray-500 text-sm'>
                    アカウント作成日:
                  </span>
                  <span className='ml-2'>
                    {new Date(user.createdAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                {user.emailVerified && (
                  <div>
                    <span className='text-gray-500 text-sm'>メール認証日:</span>
                    <span className='ml-2'>
                      {new Date(user.emailVerified).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                )}
              </div>

              <div className='mt-6'>
                <Link
                  href='/profile/settings'
                  className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                >
                  プロフィールを編集
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-8'>
        <h3 className='text-lg font-medium mb-4'>あなたのTodo統計</h3>

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <div className='bg-white p-4 rounded-lg shadow'>
            <div className='text-2xl font-bold text-indigo-600'>
              {totalCount}
            </div>
            <div className='text-gray-500'>合計Todoタスク</div>
          </div>

          <div className='bg-white p-4 rounded-lg shadow'>
            <div className='text-2xl font-bold text-green-600'>
              {completedCount}
            </div>
            <div className='text-gray-500'>完了タスク</div>
          </div>

          <div className='bg-white p-4 rounded-lg shadow'>
            <div className='text-2xl font-bold text-yellow-600'>
              {incompleteCount}
            </div>
            <div className='text-gray-500'>未完了タスク</div>
          </div>
        </div>
      </div>
    </div>
  )
}
