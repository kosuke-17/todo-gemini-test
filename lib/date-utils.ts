// 期限の状態を確認する関数
export function getDueStatus(
  dueDate: Date | null
): 'overdue' | 'soon' | 'normal' | 'none' {
  if (!dueDate) return 'none'

  const now = new Date()
  const diff = dueDate.getTime() - now.getTime()
  const hoursDiff = diff / (1000 * 60 * 60)

  if (diff < 0) return 'overdue'
  if (hoursDiff < 24) return 'soon'
  return 'normal'
}

// 期限の表示用フォーマット関数
export function formatDueDate(dueDate: Date | null): string {
  if (!dueDate) return ''

  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // 同じ日付かどうか確認（時間は無視）
  const isToday =
    dueDate.getDate() === now.getDate() &&
    dueDate.getMonth() === now.getMonth() &&
    dueDate.getFullYear() === now.getFullYear()

  const isTomorrow =
    dueDate.getDate() === tomorrow.getDate() &&
    dueDate.getMonth() === tomorrow.getMonth() &&
    dueDate.getFullYear() === tomorrow.getFullYear()

  if (isToday) {
    return `今日 ${dueDate.getHours()}:${dueDate
      .getMinutes()
      .toString()
      .padStart(2, '0')}`
  }

  if (isTomorrow) {
    return `明日 ${dueDate.getHours()}:${dueDate
      .getMinutes()
      .toString()
      .padStart(2, '0')}`
  }

  // そのほかの日付
  return `${
    dueDate.getMonth() + 1
  }月${dueDate.getDate()}日 ${dueDate.getHours()}:${dueDate
    .getMinutes()
    .toString()
    .padStart(2, '0')}`
}
