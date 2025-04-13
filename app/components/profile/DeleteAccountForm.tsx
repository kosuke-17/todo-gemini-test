'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { deleteAccount } from '@/app/actions/profile'

// バリデーションスキーマ
const deleteAccountSchema = z.object({
  password: z.string().min(1, 'パスワードを入力してください'),
  confirmation: z.literal('delete my account', {
    errorMap: () => ({
      message: '「delete my account」と正確に入力してください',
    }),
  }),
})

type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>

export default function DeleteAccountForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: '',
      confirmation: '' as z.infer<typeof deleteAccountSchema>['confirmation'],
    },
  })

  const onSubmit = async (data: DeleteAccountFormValues) => {
    setError(null)

    // フォームデータの作成
    const formData = new FormData()
    formData.append('password', data.password)
    formData.append('confirmation', data.confirmation)

    startTransition(async () => {
      try {
        // Server Functionの呼び出し
        // この関数が成功すると、リダイレクトが発生するため、成功ハンドリングは不要
        const result = await deleteAccount(formData)

        // リダイレクトされなかった場合はエラーがある
        if (result && !result.success) {
          setError(result.error || 'アカウント削除中にエラーが発生しました')
        }
      } catch (err) {
        console.error('Error deleting account:', err)
        setError('アカウント削除中にエラーが発生しました')
      }
    })
  }

  return (
    <div className='bg-white p-6 rounded-lg shadow border border-red-200'>
      <h3 className='text-lg font-medium text-red-600 mb-4'>
        アカウントの削除
      </h3>

      <p className='text-sm text-gray-700 mb-4'>
        アカウントを削除すると、すべてのデータが永久に削除され、元に戻すことはできません。
        この操作は取り消しできませんので、慎重に行ってください。
      </p>

      {!showConfirmation ? (
        <button
          type='button'
          onClick={() => setShowConfirmation(true)}
          className='mt-2 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
        >
          アカウントを削除
        </button>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='bg-red-50 p-4 rounded-md border border-red-100 mb-4'>
            <p className='text-sm text-red-800 font-medium'>
              警告: この操作は取り消しできません
            </p>
            <p className='text-sm text-red-700 mt-1'>
              アカウントを削除すると、以下のデータが完全に削除されます：
            </p>
            <ul className='list-disc list-inside text-sm text-red-700 mt-2'>
              <li>すべてのTodoタスク</li>
              <li>アカウント情報</li>
              <li>設定とプリファレンス</li>
            </ul>
          </div>

          <div>
            <label
              htmlFor='confirmation'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              確認のため「delete my account」と入力してください
            </label>
            <input
              id='confirmation'
              type='text'
              {...register('confirmation')}
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500'
              disabled={isPending}
            />
            {errors.confirmation && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.confirmation.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              パスワードを入力して確認
            </label>
            <input
              id='password'
              type='password'
              {...register('password')}
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500'
              disabled={isPending}
            />
            {errors.password && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.password.message}
              </p>
            )}
          </div>

          {error && (
            <div className='rounded-md bg-red-50 p-4'>
              <div className='text-sm text-red-700'>{error}</div>
            </div>
          )}

          <div className='flex space-x-3'>
            <button
              type='button'
              onClick={() => setShowConfirmation(false)}
              className='inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              disabled={isPending}
            >
              キャンセル
            </button>
            <button
              type='submit'
              disabled={isPending}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                isPending ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isPending ? '処理中...' : 'アカウントを完全に削除する'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
