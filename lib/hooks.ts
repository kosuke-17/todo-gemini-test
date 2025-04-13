import { useState, useEffect } from 'react'

// デバウンス処理のためのカスタムフック
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // 指定された遅延後に値を更新するタイマーを設定
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // クリーンアップ関数でタイマーをクリア
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
