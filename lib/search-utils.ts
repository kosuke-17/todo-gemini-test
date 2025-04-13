import { Todo } from '@prisma/client'
import { type SearchParams } from '@/app/components/TodoSearch'

/**
 * Todo検索関数 - 指定された検索条件に基づいてTodoリストをフィルタリングします
 */
export function searchTodos(todos: Todo[], searchParams: SearchParams): Todo[] {
  return todos.filter((todo) => {
    // キーワード検索
    if (
      searchParams.keyword &&
      !todo.content.toLowerCase().includes(searchParams.keyword.toLowerCase())
    ) {
      return false
    }

    // 状態フィルタ
    if (searchParams.status !== 'all') {
      if (searchParams.status === 'completed' && !todo.completed) {
        return false
      }
      if (searchParams.status === 'active' && todo.completed) {
        return false
      }
    }

    // 優先度フィルタ
    if (
      searchParams.priority !== 'ALL' &&
      todo.priority !== searchParams.priority
    ) {
      return false
    }

    // 期限フィルタ
    if (searchParams.dueDate !== 'all') {
      // 期限がない場合
      if (searchParams.dueDate === 'none') {
        return todo.dueDate === null
      }

      // 期限がある場合のフィルタ
      if (!todo.dueDate) {
        return false
      }

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const todoDueDate = new Date(todo.dueDate)

      switch (searchParams.dueDate) {
        case 'today':
          // 今日の終わりまで
          const endOfToday = new Date(today)
          endOfToday.setHours(23, 59, 59, 999)
          return todoDueDate <= endOfToday

        case 'week':
          // 今週の終わりまで（日曜日）
          const endOfWeek = new Date(today)
          const daysUntilSunday = 7 - endOfWeek.getDay()
          endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday)
          endOfWeek.setHours(23, 59, 59, 999)
          return todoDueDate <= endOfWeek

        case 'overdue':
          // 期限切れ（現在時刻より前）
          return todoDueDate < now
      }
    }

    // すべての条件を満たす
    return true
  })
}

/**
 * 検索結果のハイライト - キーワードに一致するテキスト部分をハイライトします
 */
export function highlightKeyword(text: string, keyword: string): string {
  if (!keyword) return text

  const regex = new RegExp(`(${keyword})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}
