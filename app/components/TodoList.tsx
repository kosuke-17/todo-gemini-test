'use client'

import { type Todo } from '@prisma/client' // Prisma が生成した Todo 型をインポート
import TodoItem from './TodoItem'
import TodoSearch, { type SearchParams } from './TodoSearch'
import { useState, useMemo } from 'react'
import { sortByPriority } from '@/lib/priority-utils'
import { searchTodos } from '@/lib/search-utils'

interface TodoListProps {
  todos: Todo[]
}

export default function TodoList({ todos }: TodoListProps) {
  const [sortBy, setSortBy] = useState<'priority' | 'date'>('date')
  const [searchParams, setSearchParams] = useState<SearchParams>({
    keyword: '',
    status: 'all',
    priority: 'ALL',
    dueDate: 'all',
  })

  // 検索条件に基づいてフィルタリングされたTodoリスト
  const filteredTodos = useMemo(() => {
    // 検索フィルタリング
    const searchResults = searchTodos(todos, searchParams)

    // ソート
    if (sortBy === 'priority') {
      return sortByPriority(searchResults)
    } else {
      // createdAtの降順（最新順）
      return [...searchResults].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    }
  }, [todos, searchParams, sortBy])

  // 検索ハンドラ
  const handleSearch = (params: SearchParams) => {
    setSearchParams(params)
  }

  // Todoがない場合
  if (todos.length === 0) {
    return (
      <div>
        <TodoSearch onSearch={handleSearch} />
        <p className='text-center text-gray-500'>Todo はまだありません。</p>
      </div>
    )
  }

  // フィルタリング後にもTodoがない場合
  if (filteredTodos.length === 0) {
    return (
      <div>
        <TodoSearch onSearch={handleSearch} />

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
        </div>

        <p className='text-center text-gray-500'>
          検索条件に一致するTodoはありません。
        </p>
      </div>
    )
  }

  return (
    <div>
      <TodoSearch onSearch={handleSearch} />

      <div className='mb-4 flex flex-wrap gap-2 justify-between items-end'>
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

        <div className='text-sm text-gray-600'>
          {filteredTodos.length} 件表示（全 {todos.length} 件）
        </div>
      </div>

      <ul className='space-y-3'>
        {filteredTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            searchKeyword={searchParams.keyword}
          />
        ))}
      </ul>
    </div>
  )
}
