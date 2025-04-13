import { type Priority } from './schema'

// 優先順位の日本語名称マッピング
export const priorityNames: Record<Priority, string> = {
  NONE: 'なし',
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
  URGENT: '最高',
}

// 優先順位の色クラスマッピング
export const priorityColors: Record<
  Priority,
  { bg: string; border: string; text: string }
> = {
  NONE: { bg: '', border: '', text: '' },
  LOW: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' },
  MEDIUM: {
    bg: 'bg-yellow-100',
    border: 'border-yellow-300',
    text: 'text-yellow-800',
  },
  HIGH: {
    bg: 'bg-orange-100',
    border: 'border-orange-300',
    text: 'text-orange-800',
  },
  URGENT: { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800' },
}

// 優先順位の値（ソート用）
export const priorityValues: Record<Priority, number> = {
  NONE: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  URGENT: 4,
}

// 優先順位でソートする関数
export function sortByPriority<T extends { priority: Priority }>(
  items: T[],
  ascending = false
): T[] {
  return [...items].sort((a, b) => {
    const valueA = priorityValues[a.priority]
    const valueB = priorityValues[b.priority]
    return ascending ? valueA - valueB : valueB - valueA
  })
}
