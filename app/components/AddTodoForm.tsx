'use client'

import { useActionState, useRef, useEffect, useState } from 'react'
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
  const [showDatePicker, setShowDatePicker] = useState(false)

  useEffect(() => {
    // Action が成功したらフォームをリセット
    if (state?.status === 'success') {
      formRef.current?.reset()
      setShowDatePicker(false)
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
          type='button'
          onClick={() => setShowDatePicker(!showDatePicker)}
          className='px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100'
        >
          {showDatePicker ? '期限を隠す' : '期限を設定'}
        </button>
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

      {/* 日付選択UI */}
      {showDatePicker && (
        <div className='mt-3'>
          <label htmlFor='dueDate' className='block text-sm text-gray-700 mb-1'>
            期限日時:
          </label>
          <input
            type='datetime-local'
            id='dueDate'
            name='dueDate'
            className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <button
            type='button'
            onClick={() => {
              const input = formRef.current?.querySelector(
                'input[name="dueDate"]'
              ) as HTMLInputElement
              if (input) input.value = ''
            }}
            className='ml-2 px-2 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100'
          >
            クリア
          </button>
        </div>
      )}

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
