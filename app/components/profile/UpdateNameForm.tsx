'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User } from '@prisma/client'
import { updateProfileName } from '@/app/actions/profile'
import { useRouter } from 'next/navigation'

// バリデーションスキーマ
const nameSchema = z.object({
  name: z
    .string()
    .min(2, '名前は2文字以上で入力してください')
    .max(50, '名前は50文字以下で入力してください'),
})

type NameFormValues = z.infer<typeof nameSchema>

interface UpdateNameFormProps {
  user: Pick<User, 'id' | 'name'>
}

export default function UpdateNameForm({ user }: UpdateNameFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      name: user.name || '',
    },
  })

  const onSubmit = async (data: NameFormValues) => {
    if (data.name === user.name) {
      setError('現在と同じ名前です')
      return
    }

    setSuccess(null)
    setError(null)

    // フォームデータの作成
    const formData = new FormData()
    formData.append('name', data.name)

    startTransition(async () => {
      try {
        // Server Functionの呼び出し
        const result = await updateProfileName(formData)

        if (result.success) {
          setSuccess(result.message || 'プロフィール名を更新しました')
          router.refresh() // UIの更新
        } else {
          setError(result.error || 'エラーが発生しました')
        }
      } catch (err) {
        console.error('Error updating profile name:', err)
        setError('更新中にエラーが発生しました')
      }
    })
  }

  return (
    <div className='bg-white p-6 rounded-lg shadow'>
      <h3 className='text-lg font-medium mb-4'>プロフィール名の変更</h3>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <div>
          <label
            htmlFor='name'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            名前
          </label>
          <input
            id='name'
            type='text'
            {...register('name')}
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
            disabled={isPending}
          />
          {errors.name && (
            <p className='mt-1 text-sm text-red-600'>{errors.name.message}</p>
          )}
        </div>

        {error && (
          <div className='rounded-md bg-red-50 p-4'>
            <div className='text-sm text-red-700'>{error}</div>
          </div>
        )}

        {success && (
          <div className='rounded-md bg-green-50 p-4'>
            <div className='text-sm text-green-700'>{success}</div>
          </div>
        )}

        <div>
          <button
            type='submit'
            disabled={isPending}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isPending ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isPending ? '更新中...' : '名前を更新'}
          </button>
        </div>
      </form>
    </div>
  )
}
