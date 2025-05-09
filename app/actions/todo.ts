'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import {
  CreateTodoSchema,
  DeleteTodoSchema,
  UpdateTodoDueDateSchema,
  UpdateTodoPrioritySchema,
} from '@/lib/schema'
import { Prisma } from '@prisma/client' // Prismaの型を利用
import { getSession } from '@/lib/auth'

// Action State の型定義
export type TodoActionState = {
  status: 'success' | 'error'
  message: string
  errors?: Record<string, string[]> // Zodのエラー詳細
} | null // 初期状態

// Todo 作成 Action
export async function createTodo(
  prevState: TodoActionState | null,
  formData: FormData
): Promise<TodoActionState> {
  // 1. formData からデータを抽出
  const rawData = {
    content: formData.get('content'),
    dueDate: formData.get('dueDate'),
    priority: formData.get('priority') || 'NONE',
  }

  // 2. Zod でバリデーション
  const validatedFields = CreateTodoSchema.safeParse(rawData)

  if (!validatedFields.success) {
    console.error(
      'Validation Error:',
      validatedFields.error.flatten().fieldErrors
    )
    return {
      status: 'error',
      message: '入力内容に誤りがあります。',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // 3. データベースに保存
  try {
    // セッションからユーザーIDを取得
    const session = await getSession()
    if (!session?.user?.id) {
      return { status: 'error', message: '認証されていません。' }
    }

    await prisma.todo.create({
      data: {
        content: validatedFields.data.content,
        dueDate: validatedFields.data.dueDate
          ? new Date(validatedFields.data.dueDate)
          : null,
        priority: validatedFields.data.priority,
        userId: session.user.id,
      },
    })

    // 4. キャッシュを更新
    revalidatePath('/') // '/' パスのキャッシュを無効化

    return { status: 'success', message: 'Todo を追加しました。' }
  } catch (e) {
    console.error('Database Error:', e)
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // Prisma特有のエラーハンドリング (例: ユニーク制約違反など)
      // ここでは一般的なエラーとして処理
    }
    return { status: 'error', message: 'データベースエラーが発生しました。' }
  }
}

// Todo 更新 Action (例: 完了状態の切り替え)
export async function toggleTodoComplete(
  prevState: TodoActionState | null,
  formData: FormData
): Promise<TodoActionState> {
  // 1. formData から ID を抽出
  const rawData = {
    id: Number(formData.get('id')), // formDataの値はstringなのでNumberに変換
    completed: formData.get('completed') === 'true', // チェックボックスの値は 'on' or null かもしれないので注意が必要
  }
  // 実際には hidden input などで boolean 値を送信する方が確実

  // 2. Zod でバリデーション (UpdateTodoSchemaを流用または専用スキーマ作成)
  // ここでは簡単化のため ID のみバリデーション
  const idValidation = z.number().int().positive().safeParse(rawData.id)
  if (!idValidation.success) {
    return { status: 'error', message: 'IDが不正です。' }
  }

  // 3. データベースを更新
  try {
    await prisma.todo.update({
      where: { id: idValidation.data },
      data: { completed: rawData.completed },
    })

    // 4. キャッシュを更新
    revalidatePath('/')

    return { status: 'success', message: 'Todo の状態を更新しました。' }
  } catch (e) {
    console.error('Database Error:', e)
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2025'
    ) {
      return {
        status: 'error',
        message: '対象の Todo が見つかりませんでした。',
      }
    }
    return { status: 'error', message: 'データベースエラーが発生しました。' }
  }
}

// Todo 削除 Action
export async function deleteTodo(
  prevState: TodoActionState | null,
  formData: FormData
): Promise<TodoActionState> {
  // 1. formData から ID を抽出
  const rawData = {
    id: Number(formData.get('id')),
  }

  // 2. Zod でバリデーション
  const validatedFields = DeleteTodoSchema.safeParse(rawData)
  if (!validatedFields.success) {
    return {
      status: 'error',
      message: 'IDが不正です。',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // 3. データベースから削除
  try {
    await prisma.todo.delete({
      where: { id: validatedFields.data.id },
    })

    // 4. キャッシュを更新
    revalidatePath('/')

    return { status: 'success', message: 'Todo を削除しました。' }
  } catch (e) {
    console.error('Database Error:', e)
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2025'
    ) {
      // Record to delete does not exist.
      return {
        status: 'error',
        message: '削除対象の Todo が見つかりませんでした。',
      }
    }
    return { status: 'error', message: 'データベースエラーが発生しました。' }
  }
}

// Todo期限更新Action
export async function updateTodoDueDate(
  prevState: TodoActionState | null,
  formData: FormData
): Promise<TodoActionState> {
  // 1. formData からデータを抽出
  const rawData = {
    id: Number(formData.get('id')),
    dueDate: formData.get('dueDate'),
  }

  // 2. Zod でバリデーション
  const validatedFields = UpdateTodoDueDateSchema.safeParse(rawData)
  if (!validatedFields.success) {
    return {
      status: 'error',
      message: '入力内容に誤りがあります。',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // 3. データベースを更新
  try {
    await prisma.todo.update({
      where: { id: validatedFields.data.id },
      data: {
        dueDate: validatedFields.data.dueDate
          ? new Date(validatedFields.data.dueDate)
          : null,
      },
    })

    // 4. キャッシュを更新
    revalidatePath('/')

    return { status: 'success', message: 'Todoの期限を更新しました。' }
  } catch (e) {
    console.error('Database Error:', e)
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2025'
    ) {
      return {
        status: 'error',
        message: '対象の Todo が見つかりませんでした。',
      }
    }
    return { status: 'error', message: 'データベースエラーが発生しました。' }
  }
}

// Todo優先順位更新Action
export async function updateTodoPriority(
  prevState: TodoActionState | null,
  formData: FormData
): Promise<TodoActionState> {
  // 1. formData からデータを抽出
  const rawData = {
    id: Number(formData.get('id')),
    priority: formData.get('priority'),
  }

  // 2. Zod でバリデーション
  const validatedFields = UpdateTodoPrioritySchema.safeParse(rawData)
  if (!validatedFields.success) {
    return {
      status: 'error',
      message: '入力内容に誤りがあります。',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // 3. データベースを更新
  try {
    await prisma.todo.update({
      where: { id: validatedFields.data.id },
      data: {
        priority: validatedFields.data.priority,
      },
    })

    // 4. キャッシュを更新
    revalidatePath('/')

    return { status: 'success', message: 'Todoの優先順位を更新しました。' }
  } catch (e) {
    console.error('Database Error:', e)
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2025'
    ) {
      return {
        status: 'error',
        message: '対象の Todo が見つかりませんでした。',
      }
    }
    return { status: 'error', message: 'データベースエラーが発生しました。' }
  }
}
