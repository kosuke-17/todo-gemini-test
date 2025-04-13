'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User } from '@prisma/client'
// import { initiateEmailChange } from '@/app/actions/profile'

// バリデーションスキーマ
const emailChangeSchema = z.object({
  password: z.string().min(1, 'パスワードを入力してください'),
  newEmail: z
    .string()
    .email('有効なメールアドレスを入力してください')
    .min(1, 'メールアドレスを入力してください'),
})

type EmailFormValues = z.infer<typeof emailChangeSchema>

interface UpdateEmailFormProps {
  user: Pick<User, 'id' | 'email'>
}

export default function UpdateEmailForm({ user }: UpdateEmailFormProps) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmailFormValues>({
    resolver: zodResolver(emailChangeSchema),
    defaultValues: {
      password: '',
      newEmail: '',
    },
  })

  const onSubmit = async (data: EmailFormValues) => {
    // 同じメールアドレスでの変更リクエストを避ける
    if (data.newEmail === user.email) {
      setError('現在と同じメールアドレスです')
      return
    }

    setSuccess(null)
    setError(null)

    // フォームデータの作成
    const formData = new FormData()
    formData.append('password', data.password)
    formData.append('newEmail', data.newEmail)

    startTransition(async () => {
      try {
        // Server Functionの呼び出し
        // TODO: SMTPサーバーを設定してください
        // const result = await initiateEmailChange(formData)
        // if (result.success) {
        //   setSuccess(
        //     result.message || 'メールアドレス変更の確認メールを送信しました'
        //   )
        //   reset() // フォームをリセット
        //   setShowForm(false) // フォーム表示を閉じる
        // } else {
        //   setError(result.error || 'エラーが発生しました')
        // }
      } catch (err) {
        console.error('Error initiating email change:', err)
        setError('メールアドレス変更の処理中にエラーが発生しました')
      }
    })
  }

  return (
    <div className='bg-white p-6 rounded-lg shadow'>
      <h3 className='text-lg font-medium mb-4'>メールアドレスの変更</h3>

      <div className='mb-4'>
        <p className='text-sm text-gray-700 mb-2'>
          現在のメールアドレス:{' '}
          <span className='font-medium'>{user.email}</span>
        </p>
        <p className='text-sm text-gray-600'>
          メールアドレスを変更すると、確認メールが送信されます。メール内のリンクをクリックして変更を完了してください。
        </p>
      </div>

      {success && (
        <div className='rounded-md bg-green-50 p-4 mb-4'>
          <div className='text-sm text-green-700'>{success}</div>
        </div>
      )}

      {!showForm ? (
        <button
          type='button'
          onClick={() => setShowForm(true)}
          className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        >
          メールアドレスを変更
        </button>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <label
              htmlFor='newEmail'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              新しいメールアドレス
            </label>
            <input
              id='newEmail'
              type='email'
              {...register('newEmail')}
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
              disabled={isPending}
            />
            {errors.newEmail && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.newEmail.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              現在のパスワード（確認のため）
            </label>
            <input
              id='password'
              type='password'
              {...register('password')}
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
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
              onClick={() => {
                setShowForm(false)
                reset()
                setError(null)
              }}
              className='inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              disabled={isPending}
            >
              キャンセル
            </button>
            <button
              type='submit'
              disabled={isPending}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isPending ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isPending ? '処理中...' : '確認メールを送信'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
