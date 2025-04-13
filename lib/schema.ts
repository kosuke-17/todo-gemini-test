import { z } from 'zod'

// 優先順位のEnum型定義
export const PriorityEnum = z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'])
export type Priority = z.infer<typeof PriorityEnum>

// Todo 作成時のスキーマ
export const CreateTodoSchema = z.object({
  content: z
    .string()
    .min(1, { message: '内容を入力してください' })
    .max(255, { message: '内容は255文字以内で入力してください' }),
  dueDate: z.string().optional().nullable(),
  priority: PriorityEnum.optional().default('NONE'),
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
  priority: PriorityEnum.optional(),
})

// Todo期限更新用のスキーマ
export const UpdateTodoDueDateSchema = z.object({
  id: z.number().int().positive({ message: 'IDが不正です' }),
  dueDate: z.string().optional().nullable(),
})

// Todo優先順位更新用のスキーマ
export const UpdateTodoPrioritySchema = z.object({
  id: z.number().int().positive({ message: 'IDが不正です' }),
  priority: PriorityEnum,
})

// Todo 削除時のスキーマ
export const DeleteTodoSchema = z.object({
  id: z.number().int().positive({ message: 'IDが不正です' }),
})
