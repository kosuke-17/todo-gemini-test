import { type Todo } from '@prisma/client' // Prisma が生成した Todo 型をインポート
import TodoItem from './TodoItem'

interface TodoListProps {
  todos: Todo[]
}

export default function TodoList({ todos }: TodoListProps) {
  if (todos.length === 0) {
    return <p className='text-center text-gray-500'>Todo はまだありません。</p>
  }

  return (
    <ul className='space-y-3'>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  )
}
