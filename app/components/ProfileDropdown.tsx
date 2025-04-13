'use client'

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { User } from '@prisma/client'

interface ProfileDropdownProps {
  user: User
}

export default function ProfileDropdown({ user }: ProfileDropdownProps) {
  return (
    <Menu as='div' className='relative ml-3'>
      <div>
        <Menu.Button className='flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'>
          <span className='sr-only'>ユーザーメニューを開く</span>
          {user.image ? (
            <Image
              className='h-8 w-8 rounded-full'
              src={user.image}
              alt={user.name || 'ユーザー'}
              width={32}
              height={32}
            />
          ) : (
            <div className='h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center'>
              <span className='text-indigo-800 font-medium text-sm'>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
          )}
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter='transition ease-out duration-100'
        enterFrom='transform opacity-0 scale-95'
        enterTo='transform opacity-100 scale-100'
        leave='transition ease-in duration-75'
        leaveFrom='transform opacity-100 scale-100'
        leaveTo='transform opacity-0 scale-95'
      >
        <Menu.Items className='absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
          <div className='px-4 py-2 text-sm text-gray-700 border-b border-gray-100'>
            <p className='font-medium'>{user.name || 'ユーザー'}</p>
            <p className='text-xs text-gray-500 truncate'>{user.email}</p>
          </div>

          <Menu.Item>
            {({ active }: { active: boolean }) => (
              <Link
                href='/profile'
                className={`${
                  active ? 'bg-gray-100' : ''
                } block px-4 py-2 text-sm text-gray-700`}
              >
                プロフィール
              </Link>
            )}
          </Menu.Item>

          <Menu.Item>
            {({ active }: { active: boolean }) => (
              <Link
                href='/profile/settings'
                className={`${
                  active ? 'bg-gray-100' : ''
                } block px-4 py-2 text-sm text-gray-700`}
              >
                設定
              </Link>
            )}
          </Menu.Item>

          <Menu.Item>
            {({ active }: { active: boolean }) => (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className={`${
                  active ? 'bg-gray-100' : ''
                } block w-full text-left px-4 py-2 text-sm text-gray-700`}
              >
                ログアウト
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
