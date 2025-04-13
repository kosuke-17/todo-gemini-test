'use client'

import { type Todo } from '@prisma/client'
import { useActionState, useTransition, useState } from 'react'
import {
  toggleTodoComplete,
  deleteTodo,
  updateTodoDueDate,
  updateTodoPriority,
  type TodoActionState,
} from '@/app/actions/todo'
import { getDueStatus, formatDueDate } from '@/lib/date-utils'
import { priorityNames, priorityColors } from '@/lib/priority-utils'
import { type Priority } from '@/lib/schema'
import { highlightKeyword } from '@/lib/search-utils'

interface TodoItemProps {
  todo: Todo
  searchKeyword?: string
}

export default function TodoItem({ todo, searchKeyword = '' }: TodoItemProps) {
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
  // 優先順位更新用
  const [priorityState, priorityAction, isPriorityPending] = useActionState<
    TodoActionState | null,
    FormData
  >(updateTodoPriority, null)

  // useTransition を使うと Optimistic UI の実装がしやすくなる (今回は useActionState の isPending を使用)
  const [, startTransition] = useTransition()

  // 期限編集モード
  const [isEditingDueDate, setIsEditingDueDate] = useState(false)
  // 優先順位編集モード
  const [isEditingPriority, setIsEditingPriority] = useState(false)
  // 選択中の優先順位
  const [selectedPriority, setSelectedPriority] = useState<Priority>(
    todo.priority
  )

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

  const handlePriorityUpdate = (formData: FormData) => {
    startTransition(() => {
      priorityAction(formData)
      setIsEditingPriority(false)
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

  // アクション中か判定
  const isProcessing =
    isTogglePending || isDeletePending || isDueDatePending || isPriorityPending

  // 優先順位に基づいた左ボーダー色を取得
  const getPriorityBorder = () => {
    const { border } = priorityColors[todo.priority as Priority]
    return border ? `border-l-4 ${border}` : ''
  }

  // 検索キーワードに一致するコンテンツをハイライト表示
  const highlightedContent = searchKeyword ? (
    <span
      dangerouslySetInnerHTML={{
        __html: highlightKeyword(todo.content, searchKeyword),
      }}
      className={`${todo.completed ? 'line-through text-gray-500' : ''}`}
    />
  ) : (
    <span className={`${todo.completed ? 'line-through text-gray-500' : ''}`}>
      {todo.content}
    </span>
  )

  return (
    <li
      className={`flex flex-col p-3 rounded-md border ${
        todo.completed ? 'border-gray-300 bg-gray-50' : 'border-gray-200'
      } ${getPriorityBorder()}`}
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
              disabled={isProcessing} // 処理中は無効化
              className={`h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                isTogglePending ? 'cursor-wait' : 'cursor-pointer'
              }`}
            />
          </form>
          <div className='flex flex-col'>
            {highlightedContent}

            {/* 優先順位バッジ表示（NONEの場合は表示しない） */}
            {todo.priority !== 'NONE' && (
              <span
                className={`text-xs mt-1 ${
                  priorityColors[todo.priority as Priority].text
                }`}
              >
                {priorityNames[todo.priority as Priority]}
              </span>
            )}
          </div>
        </div>

        {/* 削除ボタンフォーム */}
        <form action={handleDelete}>
          <input type='hidden' name='id' value={todo.id} />
          <button
            type='submit'
            disabled={isProcessing}
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
                  disabled={isProcessing}
                  className='text-xs text-blue-600 hover:underline'
                >
                  編集
                </button>
              </>
            ) : (
              <button
                type='button'
                onClick={() => setIsEditingDueDate(true)}
                disabled={isProcessing}
                className='text-xs text-gray-500 hover:text-gray-700'
              >
                期限を設定
              </button>
            )}
          </div>
        )}
      </div>

      {/* 優先順位編集エリア */}
      <div className='ml-8 mt-2'>
        {isEditingPriority ? (
          <form action={handlePriorityUpdate} className='flex flex-col gap-2'>
            <input type='hidden' name='id' value={todo.id} />
            <input type='hidden' name='priority' value={selectedPriority} />

            <div className='flex flex-wrap gap-1 mb-2'>
              {Object.entries(priorityNames).map(([key, name]) => {
                const priority = key as Priority
                const { bg, text } = priorityColors[priority]
                return (
                  <button
                    key={key}
                    type='button'
                    onClick={() => setSelectedPriority(priority)}
                    className={`px-2 py-1 text-xs rounded-md border ${
                      selectedPriority === priority
                        ? `${bg} ${text} font-medium border-gray-400`
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {name}
                  </button>
                )
              })}
            </div>

            <div className='flex gap-2'>
              <button
                type='submit'
                disabled={isPriorityPending}
                className='px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200'
              >
                {isPriorityPending ? '更新中...' : '優先度を保存'}
              </button>
              <button
                type='button'
                onClick={() => {
                  setIsEditingPriority(false)
                  setSelectedPriority(todo.priority as Priority)
                }}
                className='px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100'
              >
                キャンセル
              </button>
            </div>
          </form>
        ) : (
          <button
            type='button'
            onClick={() => setIsEditingPriority(true)}
            disabled={isProcessing}
            className='text-xs text-gray-500 hover:text-gray-700'
          >
            {todo.priority === 'NONE' ? '優先度を設定' : '優先度を変更'}
          </button>
        )}
      </div>

      {/* エラーメッセージ表示 */}
      {(toggleState?.status === 'error' ||
        deleteState?.status === 'error' ||
        dueDateState?.status === 'error' ||
        priorityState?.status === 'error') && (
        <p className='text-xs text-red-500 mt-1'>
          {toggleState?.message ||
            deleteState?.message ||
            dueDateState?.message ||
            priorityState?.message}
        </p>
      )}
    </li>
  )
}
