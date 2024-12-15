'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthButton from '@/components/AuthButton'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/profile')
    }
  }, [user, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 flex flex-col items-center bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Welcome to LeChess</h1>
        <AuthButton />
      </div>
    </div>
  )
}

