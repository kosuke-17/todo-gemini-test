'use client'

import { type Todo } from '@prisma/client'
import { useActionState, useTransition, useState } from 'react'
import {
  toggleTodoComplete,
  deleteTodo,
  updateTodoDueDate,
  type TodoActionState,
} from '@/app/actions/todo'
import { getDueStatus, formatDueDate } from '@/lib/date-utils'

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
  // 期限更新用
  const [dueDateState, dueDateAction, isDueDatePending] = useActionState<
    TodoActionState | null,
    FormData
  >(updateTodoDueDate, null)

  // useTransition を使うと Optimistic UI の実装がしやすくなる (今回は useActionState の isPending を使用)
  const [, startTransition] = useTransition()

  // 期限編集モード
  const [isEditingDueDate, setIsEditingDueDate] = useState(false)

  const handleToggle = (formData: FormData) => {
    startTransition(() => {
      // Optimistic UI を行う場合
      toggleAction(formData)
    })
  }

  const handleDelete = (formData: FormData) => {
    startTransition(() => {
      deleteAction(formData)
    })
  }

  const handleDueDateUpdate = (formData: FormData) => {
    startTransition(() => {
      dueDateAction(formData)
      setIsEditingDueDate(false)
    })
  }

  // 期限の状態に基づいた色を返す
  const getDueStatusColor = () => {
    const status = getDueStatus(todo.dueDate)
    switch (status) {
      case 'overdue':
        return 'text-red-600'
      case 'soon':
        return 'text-orange-500'
      case 'normal':
        return 'text-gray-600'
      default:
        return ''
    }
  }

  return (
    <li
      className={`flex flex-col p-3 rounded-md border ${
        todo.completed ? 'border-gray-300 bg-gray-50' : 'border-gray-200'
      }`}
    >
      <div className='flex items-center justify-between'>
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
              disabled={isTogglePending || isDeletePending || isDueDatePending} // 処理中は無効化
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
            disabled={isDeletePending || isTogglePending || isDueDatePending}
            className={`px-3 py-1 text-sm rounded-md text-red-600 hover:bg-red-100 ${
              isDeletePending ? 'opacity-50 cursor-wait' : ''
            }`}
          >
            {isDeletePending ? '削除中...' : '削除'}
          </button>
        </form>
      </div>

      {/* 期限表示/編集エリア */}
      <div className='ml-8 mt-2'>
        {isEditingDueDate ? (
          <form
            action={handleDueDateUpdate}
            className='flex items-center gap-2'
          >
            <input type='hidden' name='id' value={todo.id} />
            <input
              type='datetime-local'
              name='dueDate'
              defaultValue={
                todo.dueDate ? todo.dueDate.toISOString().slice(0, 16) : ''
              }
              className='px-2 py-1 text-sm border border-gray-300 rounded'
            />
            <button
              type='submit'
              disabled={isDueDatePending}
              className='px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200'
            >
              {isDueDatePending ? '更新中...' : '保存'}
            </button>
            <button
              type='button'
              onClick={() => setIsEditingDueDate(false)}
              className='px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100'
            >
              キャンセル
            </button>
          </form>
        ) : (
          <div className='flex items-center gap-2'>
            {todo.dueDate ? (
              <>
                <span className={`text-sm ${getDueStatusColor()}`}>
                  期限: {formatDueDate(todo.dueDate)}
                </span>
                <button
                  type='button'
                  onClick={() => setIsEditingDueDate(true)}
                  disabled={
                    isTogglePending || isDeletePending || isDueDatePending
                  }
                  className='text-xs text-blue-600 hover:underline'
                >
                  編集
                </button>
              </>
            ) : (
              <button
                type='button'
                onClick={() => setIsEditingDueDate(true)}
                disabled={
                  isTogglePending || isDeletePending || isDueDatePending
                }
                className='text-xs text-gray-500 hover:text-gray-700'
              >
                期限を設定
              </button>
            )}
          </div>
        )}
      </div>

      {/* エラーメッセージ表示 */}
      {(toggleState?.status === 'error' ||
        deleteState?.status === 'error' ||
        dueDateState?.status === 'error') && (
        <p className='text-xs text-red-500 mt-1'>
          {toggleState?.message ||
            deleteState?.message ||
            dueDateState?.message}
        </p>
      )}
    </li>
  )
}
