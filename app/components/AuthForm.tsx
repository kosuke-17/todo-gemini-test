'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type AuthFormType = 'login' | 'register'

interface AuthFormProps {
  type: AuthFormType
  callbackUrl?: string
}

export default function AuthForm({ type, callbackUrl = '/' }: AuthFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isLogin = type === 'login'
  const buttonText = isLogin ? 'ログイン' : '登録'
  const toggleText = isLogin
    ? 'アカウントをお持ちでない場合は、こちらから登録'
    : 'すでにアカウントをお持ちの場合は、こちらからログイン'
  const toggleLink = isLogin ? '/auth/register' : '/auth/login'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (isLogin) {
        // ログイン処理
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password,
        })

        if (result?.error) {
          setError('メールアドレスまたはパスワードが正しくありません')
          setIsLoading(false)
          return
        }

        router.push(callbackUrl)
      } else {
        // 登録処理
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, password }),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || '登録中にエラーが発生しました')
          setIsLoading(false)
          return
        }

        // 登録成功後、自動的にログイン
        const signInResult = await signIn('credentials', {
          redirect: false,
          email,
          password,
        })

        if (signInResult?.error) {
          setError('アカウントは作成されましたが、ログインに失敗しました')
          setIsLoading(false)
          return
        }

        router.push(callbackUrl)
      }
    } catch (err) {
      console.error(err)
      setError('予期せぬエラーが発生しました')
      setIsLoading(false)
    }
  }

  return (
    <div className='flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-gray-900'>
          {isLogin ? 'アカウントにログイン' : '新規アカウント登録'}
        </h2>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10'>
          {error && (
            <div className='mb-4 rounded-md bg-red-50 p-4'>
              <div className='text-sm text-red-700'>{error}</div>
            </div>
          )}

          <form className='space-y-6' onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label
                  htmlFor='name'
                  className='block text-sm font-medium leading-6 text-gray-900'
                >
                  名前
                </label>
                <div className='mt-2'>
                  <input
                    id='name'
                    name='name'
                    type='text'
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                メールアドレス
              </label>
              <div className='mt-2'>
                <input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                パスワード
              </label>
              <div className='mt-2'>
                <input
                  id='password'
                  name='password'
                  type='password'
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>

            {isLogin && (
              <div className='text-sm'>
                <Link
                  href='/auth/forgot-password'
                  className='font-medium text-indigo-600 hover:text-indigo-500'
                >
                  パスワードをお忘れですか？
                </Link>
              </div>
            )}

            <div>
              <button
                type='submit'
                disabled={isLoading}
                className='flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50'
              >
                {isLoading ? '処理中...' : buttonText}
              </button>
            </div>
          </form>

          <div className='mt-6'>
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300' />
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='bg-white px-2 text-gray-500'>または</span>
              </div>
            </div>

            <div className='mt-6 text-center text-sm text-gray-500'>
              {toggleText}{' '}
              <Link
                href={toggleLink}
                className='font-medium text-indigo-600 hover:text-indigo-500'
              >
                {isLogin ? '登録する' : 'ログインする'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
