'use client'

import { useState, useEffect, useRef } from 'react'
import { type Priority } from '@/lib/schema'
import { priorityNames } from '@/lib/priority-utils'
import { useDebounce } from '@/lib/hooks'

// 検索パラメータの型定義
export type SearchParams = {
  keyword: string
  status: 'all' | 'completed' | 'active'
  priority: Priority | 'ALL'
  dueDate: 'all' | 'today' | 'week' | 'overdue' | 'none'
}

// 初期検索パラメータ
const initialSearchParams: SearchParams = {
  keyword: '',
  status: 'all',
  priority: 'ALL',
  dueDate: 'all',
}

interface TodoSearchProps {
  onSearch: (params: SearchParams) => void
}

export default function TodoSearch({ onSearch }: TodoSearchProps) {
  // 検索状態
  const [searchParams, setSearchParams] =
    useState<SearchParams>(initialSearchParams)
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  // デバウンス処理した検索キーワード（パフォーマンス最適化）
  const debouncedKeyword = useDebounce(searchParams.keyword, 300)

  // フィルターパネルの参照（外部クリック検出用）
  const filterPanelRef = useRef<HTMLDivElement>(null)

  // キーワード変更時のハンドラ
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams((prev) => ({ ...prev, keyword: e.target.value }))
  }

  // 状態フィルター変更時のハンドラ
  const handleStatusChange = (status: 'all' | 'completed' | 'active') => {
    setSearchParams((prev) => ({ ...prev, status }))
  }

  // 優先度フィルター変更時のハンドラ
  const handlePriorityChange = (priority: Priority | 'ALL') => {
    setSearchParams((prev) => ({ ...prev, priority }))
  }

  // 期限フィルター変更時のハンドラ
  const handleDueDateChange = (
    dueDate: 'all' | 'today' | 'week' | 'overdue' | 'none'
  ) => {
    setSearchParams((prev) => ({ ...prev, dueDate }))
  }

  // 検索条件クリア
  const handleClearSearch = () => {
    setSearchParams(initialSearchParams)
  }

  // 外部クリックでフィルターパネルを閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(event.target as Node)
      ) {
        setShowFilters(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // アクティブフィルターの更新
  useEffect(() => {
    const filters: string[] = []

    if (searchParams.keyword) {
      filters.push(`"${searchParams.keyword}"`)
    }

    if (searchParams.status !== 'all') {
      filters.push(searchParams.status === 'completed' ? '完了済み' : '未完了')
    }

    if (searchParams.priority !== 'ALL') {
      filters.push(`${priorityNames[searchParams.priority]}優先度`)
    }

    if (searchParams.dueDate !== 'all') {
      const dueDateText = {
        today: '今日まで',
        week: '今週まで',
        overdue: '期限切れ',
        none: '期限なし',
      }[searchParams.dueDate]

      filters.push(dueDateText)
    }

    setActiveFilters(filters)
  }, [searchParams])

  // 検索パラメータ変更時に検索実行
  useEffect(() => {
    onSearch(searchParams)
  }, [
    debouncedKeyword,
    searchParams.status,
    searchParams.priority,
    searchParams.dueDate,
    onSearch,
  ])

  return (
    <div className='mb-6 relative'>
      {/* 検索バー */}
      <div className='flex gap-2 mb-2'>
        <div className='relative flex-grow'>
          <input
            type='text'
            placeholder='🔍 Todoを検索...'
            value={searchParams.keyword}
            onChange={handleKeywordChange}
            className='w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <span className='absolute left-3 top-2.5 text-gray-400'>🔍</span>
          {searchParams.keyword && (
            <button
              onClick={() =>
                setSearchParams((prev) => ({ ...prev, keyword: '' }))
              }
              className='absolute right-3 top-2.5 text-gray-400 hover:text-gray-600'
            >
              ✕
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2 border rounded-md ${
            activeFilters.length > 0 || showFilters
              ? 'bg-blue-100 text-blue-700 border-blue-300'
              : 'border-gray-300 text-gray-700 hover:bg-gray-100'
          }`}
        >
          フィルター {activeFilters.length > 0 && `(${activeFilters.length})`}
        </button>
      </div>

      {/* アクティブフィルター表示 */}
      {activeFilters.length > 0 && (
        <div className='flex flex-wrap gap-2 mb-3'>
          <span className='text-sm text-gray-600'>フィルター:</span>
          {activeFilters.map((filter, index) => (
            <span
              key={index}
              className='text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-md'
            >
              {filter}
            </span>
          ))}
          <button
            onClick={handleClearSearch}
            className='text-sm text-red-600 hover:underline'
          >
            クリア
          </button>
        </div>
      )}

      {/* フィルターパネル */}
      {showFilters && (
        <div
          ref={filterPanelRef}
          className='absolute z-10 mt-1 p-4 bg-white border border-gray-200 rounded-md shadow-lg w-full'
        >
          {/* 状態フィルター */}
          <div className='mb-4'>
            <label className='block text-sm text-gray-700 mb-2'>
              ステータス:
            </label>
            <div className='flex gap-2'>
              {[
                { value: 'all', label: 'すべて' },
                { value: 'active', label: '未完了' },
                { value: 'completed', label: '完了' },
              ].map((option) => (
                <button
                  key={option.value}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClick={() => handleStatusChange(option.value as any)}
                  className={`px-3 py-1 text-sm rounded-md border ${
                    searchParams.status === option.value
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 優先度フィルター */}
          <div className='mb-4'>
            <label className='block text-sm text-gray-700 mb-2'>優先度:</label>
            <div className='flex flex-wrap gap-2'>
              <button
                onClick={() => handlePriorityChange('ALL')}
                className={`px-3 py-1 text-sm rounded-md border ${
                  searchParams.priority === 'ALL'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
              >
                すべて
              </button>
              {Object.entries(priorityNames).map(([priority, label]) => (
                <button
                  key={priority}
                  onClick={() => handlePriorityChange(priority as Priority)}
                  className={`px-3 py-1 text-sm rounded-md border ${
                    searchParams.priority === priority
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 期限フィルター */}
          <div className='mb-4'>
            <label className='block text-sm text-gray-700 mb-2'>期限:</label>
            <div className='flex flex-wrap gap-2'>
              {[
                { value: 'all', label: 'すべて' },
                { value: 'today', label: '今日まで' },
                { value: 'week', label: '今週まで' },
                { value: 'overdue', label: '期限切れ' },
                { value: 'none', label: '期限なし' },
              ].map((option) => (
                <button
                  key={option.value}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClick={() => handleDueDateChange(option.value as any)}
                  className={`px-3 py-1 text-sm rounded-md border ${
                    searchParams.dueDate === option.value
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* コントロールボタン */}
          <div className='flex justify-between'>
            <button
              onClick={handleClearSearch}
              className='px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100'
            >
              クリア
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className='px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600'
            >
              適用
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
