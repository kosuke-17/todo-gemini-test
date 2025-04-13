import { prisma } from '@/lib/prisma'
import AddTodoForm from '@/app/components/AddTodoForm'
import TodoList from '@/app/components/TodoList'
import { requireAuth } from '@/lib/auth'

// Route Segment Config - 動的レンダリングを強制
// [https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic)
export const dynamic = 'force-dynamic'

export default async function Home() {
  // 認証が必要
  await requireAuth()

  // Server Component 内で直接 DB アクセス (または専用関数経由)
  const todos = await prisma.todo.findMany({
    orderBy: [
      { priority: 'desc' }, // 優先順位の降順
      { createdAt: 'desc' }, // 同じ優先順位内では作成日時の降順
    ],
  })

  return (
    <main className='container mx-auto mt-8 max-w-lg px-4'>
      <h1 className='text-3xl font-bold mb-6 text-center'>Todo 一覧</h1>
      <AddTodoForm />
      <TodoList todos={todos} />
    </main>
  )
}
