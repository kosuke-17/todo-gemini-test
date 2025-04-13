import { z } from 'zod'

// Todo 作成時のスキーマ
export const CreateTodoSchema = z.object({
  content: z
    .string()
    .min(1, { message: '内容を入力してください' })
    .max(255, { message: '内容は255文字以内で入力してください' }),
  dueDate: z.string().optional().nullable(),
})

// Todo 更新時のスキーマ (例: 内容と完了状態)
export const UpdateTodoSchema = z.object({
  id: z.number().int().positive({ message: 'IDが不正です' }),
  content: z
    .string()
    .min(1, { message: '内容を入力してください' })
    .max(255, { message: '内容は255文字以内で入力してください' })
    .optional(),
  completed: z.boolean().optional(),
  dueDate: z.string().optional().nullable(),
})

// Todo期限更新用のスキーマ
export const UpdateTodoDueDateSchema = z.object({
  id: z.number().int().positive({ message: 'IDが不正です' }),
  dueDate: z.string().optional().nullable(),
})

// Todo 削除時のスキーマ
export const DeleteTodoSchema = z.object({
  id: z.number().int().positive({ message: 'IDが不正です' }),
})
