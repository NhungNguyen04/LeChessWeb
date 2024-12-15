'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function ProfileScreen() {
  const { user, logout, isLoading, isAuthenticated, token } = useAuth()
  const [fetchedUser, setFetchedUser] = useState(user)
  const router = useRouter()

  useEffect(() => {
    console.log('useEffect - user:', user, 'isAuthenticated:', isAuthenticated, 'token', token)
    if (isAuthenticated && user) {
      setFetchedUser(user)
      console.log('User set in state:', user)
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log('Redirecting to login...');
        router.push('/login');
      } else {
        console.log('User is authenticated. Displaying profile.');
      }
    }
  }, [isAuthenticated, isLoading, router])

  const handleLogout = async () => {
    try {
      await logout() 
      console.log('Logout successful.');
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  if (isLoading) {
    console.log('ProfileScreen: Loading...')
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated || !fetchedUser) {
    console.log('ProfileScreen: Not authenticated or user data missing.')
    return null
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center p-6">
          <Image
            src="./user.svg"
            alt="Profile"
            width={120}
            height={120}
            className="rounded-full mb-4"
          />
          <h2 className="text-2xl font-bold mb-2">{fetchedUser.username}</h2>
          <p className="text-gray-600 mb-6">ID: {fetchedUser.id}</p>
          <Button variant="destructive" onClick={handleLogout}>
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

