'use client'

import { type Todo } from '@prisma/client'
import { useActionState } from 'react' // useTransitionも便利
import {
  toggleTodoComplete,
  deleteTodo,
  type TodoActionState,
} from '@/app/actions/todo'

interface TodoItemProps {
  todo: Todo
}

export default function TodoItem({ todo }: TodoItemProps) {
  // 完了状態更新用
  const [toggleState, toggleAction, isTogglePending] = useActionState<
    TodoActionState | null,
    FormData
  >(toggleTodoComplete, null)
  // 削除用
  const [deleteState, deleteAction, isDeletePending] = useActionState<
    TodoActionState | null,
    FormData
  >(deleteTodo, null)

  // useTransition を使うと Optimistic UI の実装がしやすくなる (今回は useActionState の isPending を使用)
  // const [isPending, startTransition] = useTransition();

  const handleToggle = (formData: FormData) => {
    // startTransition(() => { // Optimistic UI を行う場合
    toggleAction(formData)
    // });
  }

  const handleDelete = (formData: FormData) => {
    // startTransition(() => {
    deleteAction(formData)
    // });
  }

  return (
    <li
      className={`flex items-center justify-between p-3 rounded-md border ${
        todo.completed ? 'border-gray-300 bg-gray-50' : 'border-gray-200'
      }`}
    >
      <div className='flex items-center gap-3'>
        {/* 完了状態切り替えフォーム */}
        <form action={handleToggle}>
          <input type='hidden' name='id' value={todo.id} />
          <input
            type='hidden'
            name='completed'
            value={String(!todo.completed)}
          />{' '}
          {/* booleanを文字列に */}
          <input
            type='checkbox'
            checked={todo.completed}
            onChange={(e) => {
              // チェックボックスの変更時に即座にフォームを送信
              const formData = new FormData(e.target.form!)
              handleToggle(formData)
            }}
            disabled={isTogglePending || isDeletePending} // どちらかの処理中は無効化
            className={`h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
              isTogglePending ? 'cursor-wait' : 'cursor-pointer'
            }`}
          />
        </form>
        <span
          className={`${todo.completed ? 'line-through text-gray-500' : ''}`}
        >
          {todo.content}
        </span>
      </div>

      {/* 削除ボタンフォーム */}
      <form action={handleDelete}>
        <input type='hidden' name='id' value={todo.id} />
        <button
          type='submit'
          disabled={isDeletePending || isTogglePending}
          className={`px-3 py-1 text-sm rounded-md text-red-600 hover:bg-red-100 ${
            isDeletePending ? 'opacity-50 cursor-wait' : ''
          }`}
        >
          {isDeletePending ? '削除中...' : '削除'}
        </button>
      </form>

      {/* エラーメッセージ表示 (簡略化のためまとめて表示) */}
      {(toggleState?.status === 'error' || deleteState?.status === 'error') && (
        <p className='text-xs text-red-500 mt-1'>
          {toggleState?.message || deleteState?.message}
        </p>
      )}
    </li>
  )
}
