'use client'

import { useActionState, useRef, useEffect } from 'react'
import { createTodo, type TodoActionState } from '@/app/actions/todo' // 型をインポート

export default function AddTodoForm() {
  const [state, formAction, isPending] = useActionState<
    TodoActionState | null,
    FormData
  >(
    createTodo, // 実行する Server Action
    null // 初期状態
  )
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    // Action が成功したらフォームをリセット
    if (state?.status === 'success') {
      formRef.current?.reset()
    }
  }, [state]) // state が変化するたびに実行

  return (
    <form ref={formRef} action={formAction} className='mb-6'>
      <div className='flex gap-2'>
        <input
          type='text'
          name='content' // Server Action で formData.get('content') で取得
          placeholder='新しいTodoを入力...'
          required
          className='flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          aria-describedby='content-error'
        />
        <button
          type='submit'
          disabled={isPending} // Action 実行中はボタンを無効化
          className={`px-4 py-2 rounded-md text-white ${
            isPending
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isPending ? '追加中...' : '追加'}
        </button>
      </div>

      {/* Zod バリデーションエラー表示 */}
      {state?.status === 'error' && state.errors?.content && (
        <div id='content-error' className='mt-1 text-red-500 text-sm'>
          {state.errors.content.join(', ')}
        </div>
      )}

      {/* 一般的なエラーメッセージ表示 */}
      {state?.status === 'error' && !state.errors?.content && (
        <p className='mt-2 text-red-500 text-sm'>{state.message}</p>
      )}
      {/* 成功メッセージ表示 */}
      {state?.status === 'success' && (
        <p className='mt-2 text-green-500 text-sm'>{state.message}</p>
      )}
    </form>
  )
}
