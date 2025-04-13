import Link from 'next/link'
import ProfileDropdown from './ProfileDropdown'
import LogoutButton from './LogoutButton'
import { getCurrentUser } from '@/lib/auth'

export default async function Header() {
  const user = await getCurrentUser()
  const isAuthenticated = !!user

  return (
    <header className='bg-white shadow'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16 items-center'>
          <div className='flex-shrink-0'>
            <Link href='/' className='text-2xl font-bold text-indigo-600'>
              Todo App
            </Link>
          </div>

          <div className='flex items-center space-x-4'>
            {isAuthenticated ? (
              <>
                <Link
                  href='/profile'
                  className='text-gray-700 hover:text-indigo-600'
                >
                  プロフィール
                </Link>

                {user && <ProfileDropdown user={user} />}

                <div className='hidden sm:block'>
                  <LogoutButton variant='secondary' />
                </div>
              </>
            ) : (
              <>
                <Link
                  href='/auth/login'
                  className='text-gray-700 hover:text-indigo-600'
                >
                  ログイン
                </Link>
                <Link
                  href='/auth/register'
                  className='bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700'
                >
                  新規登録
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
