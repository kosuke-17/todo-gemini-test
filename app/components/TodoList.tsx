'use client'

import { type Todo } from '@prisma/client' // Prisma が生成した Todo 型をインポート
import TodoItem from './TodoItem'
import { useState } from 'react'
import { sortByPriority } from '@/lib/priority-utils'
import { type Priority } from '@/lib/schema'

interface TodoListProps {
  todos: Todo[]
}

export default function TodoList({ todos }: TodoListProps) {
  const [sortBy, setSortBy] = useState<'priority' | 'date'>('date')
  const [filterPriority, setFilterPriority] = useState<Priority | 'ALL'>('ALL')

  if (todos.length === 0) {
    return <p className='text-center text-gray-500'>Todo はまだありません。</p>
  }

  // フィルタリングされたTodoリスト
  let filteredTodos = [...todos]

  // 優先順位フィルタリング
  if (filterPriority !== 'ALL') {
    filteredTodos = filteredTodos.filter(
      (todo) => todo.priority === filterPriority
    )
  }

  // ソート
  if (sortBy === 'priority') {
    filteredTodos = sortByPriority(filteredTodos)
  } else {
    // createdAtの降順（最新順）
    filteredTodos = filteredTodos.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  // フィルタリング後にもTodoがない場合
  if (filteredTodos.length === 0) {
    return (
      <div>
        <div className='mb-4 flex flex-wrap gap-2'>
          <div>
            <label className='block text-sm text-gray-700 mb-1'>ソート:</label>
            <div className='flex gap-2'>
              <button
                onClick={() => setSortBy('date')}
                className={`px-3 py-1 text-sm rounded-md border ${
                  sortBy === 'date'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
              >
                日付順
              </button>
              <button
                onClick={() => setSortBy('priority')}
                className={`px-3 py-1 text-sm rounded-md border ${
                  sortBy === 'priority'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
              >
                優先度順
              </button>
            </div>
          </div>

          <div>
            <label className='block text-sm text-gray-700 mb-1'>
              優先度フィルター:
            </label>
            <div className='flex flex-wrap gap-2'>
              <button
                onClick={() => setFilterPriority('ALL')}
                className={`px-3 py-1 text-sm rounded-md border ${
                  filterPriority === 'ALL'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
              >
                すべて
              </button>
              {['NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((priority) => (
                <button
                  key={priority}
                  onClick={() => setFilterPriority(priority as Priority)}
                  className={`px-3 py-1 text-sm rounded-md border ${
                    filterPriority === priority
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className='text-center text-gray-500'>
          条件に一致するTodoはありません。
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className='mb-4 flex flex-wrap gap-2'>
        <div>
          <label className='block text-sm text-gray-700 mb-1'>ソート:</label>
          <div className='flex gap-2'>
            <button
              onClick={() => setSortBy('date')}
              className={`px-3 py-1 text-sm rounded-md border ${
                sortBy === 'date'
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'border-gray-300 hover:bg-gray-100'
              }`}
            >
              日付順
            </button>
            <button
              onClick={() => setSortBy('priority')}
              className={`px-3 py-1 text-sm rounded-md border ${
                sortBy === 'priority'
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'border-gray-300 hover:bg-gray-100'
              }`}
            >
              優先度順
            </button>
          </div>
        </div>

        <div>
          <label className='block text-sm text-gray-700 mb-1'>
            優先度フィルター:
          </label>
          <div className='flex flex-wrap gap-2'>
            <button
              onClick={() => setFilterPriority('ALL')}
              className={`px-3 py-1 text-sm rounded-md border ${
                filterPriority === 'ALL'
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'border-gray-300 hover:bg-gray-100'
              }`}
            >
              すべて
            </button>
            {['NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((priority) => (
              <button
                key={priority}
                onClick={() => setFilterPriority(priority as Priority)}
                className={`px-3 py-1 text-sm rounded-md border ${
                  filterPriority === priority
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ul className='space-y-3'>
        {filteredTodos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    </div>
  )
}
