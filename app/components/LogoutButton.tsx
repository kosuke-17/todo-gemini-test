'use client'

import { signOut } from 'next-auth/react'
import { useState } from 'react'

interface LogoutButtonProps {
  variant?: 'primary' | 'secondary' | 'text'
  className?: string
}

export default function LogoutButton({
  variant = 'primary',
  className = '',
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      console.error('ログアウト中にエラーが発生しました', error)
      setIsLoading(false)
    }
  }

  const baseStyles =
    'rounded-md font-medium focus:outline-none transition-colors'

  const variantStyles = {
    primary: 'bg-red-600 text-white px-4 py-2 hover:bg-red-700',
    secondary: 'bg-gray-200 text-gray-800 px-4 py-2 hover:bg-gray-300',
    text: 'text-red-600 hover:text-red-800 px-2 py-1',
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${className} ${
        isLoading ? 'opacity-70 cursor-not-allowed' : ''
      }`}
    >
      {isLoading ? 'ログアウト中...' : 'ログアウト'}
    </button>
  )
}
