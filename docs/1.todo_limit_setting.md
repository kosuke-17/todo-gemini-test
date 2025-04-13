# Todo 期限設定機能の設計

## 1. データモデル変更

### Prisma スキーマ修正

```prisma
model Todo {
  id        String   @id @default(cuid())
  content   String
  completed Boolean  @default(false)
  dueDate   DateTime? // 期限日時を追加（オプショナル）
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 2. コンポーネント変更

### TodoForm 修正

- 期限設定用の日時選択器を追加
- フォームデータに期限情報を含める

### TodoItem 修正

- 期限情報の表示機能追加
- 期限切れの場合の視覚的表示（色変更など）
- 期限の編集機能

## 3. サーバーアクション変更

### createTodo 修正

```typescript
export async function createTodo(formData: FormData): Promise<TodoActionState> {
  try {
    const content = formData.get('content') as string
    const dueDate = formData.get('dueDate') as string

    if (!content?.trim()) {
      return { status: 'error', message: 'タスク内容を入力してください' }
    }

    await prisma.todo.create({
      data: {
        content,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    })

    return { status: 'success' }
  } catch (error) {
    return { status: 'error', message: 'タスクの作成に失敗しました' }
  }
}
```

### updateTodoDueDate 追加

```typescript
export async function updateTodoDueDate(
  formData: FormData
): Promise<TodoActionState> {
  try {
    const id = formData.get('id') as string
    const dueDate = formData.get('dueDate') as string

    if (!id) {
      return { status: 'error', message: 'タスクIDが必要です' }
    }

    await prisma.todo.update({
      where: { id },
      data: {
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    })

    return { status: 'success' }
  } catch (error) {
    return { status: 'error', message: '期限の更新に失敗しました' }
  }
}
```

## 4. UI/UX の考慮

### 日付選択

- モバイル対応の DateTimePicker を実装
- クリアボタンで期限なしに設定可能
- 相対的な時間表示（「明日まで」「3 日後」など）

### 期限アラート表示

- 期限切れ：赤色で表示
- 期限近い（24 時間以内）：オレンジ色で表示
- 通常：灰色または標準色で表示

## 5. ユーティリティ関数

```typescript
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
```

## 6. 実装ステップ

1. Prisma スキーマの更新とマイグレーション実行
2. サーバーアクションの修正・追加
3. TodoForm コンポーネントに日付選択機能の追加
4. TodoItem コンポーネントに期限表示と視覚的表現の追加
5. 期限編集機能の実装
6. テストと QA
