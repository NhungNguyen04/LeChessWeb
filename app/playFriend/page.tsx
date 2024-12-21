'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function CreateChallenge() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [challengeUrl, setChallengeUrl] = useState('')
  const [challengeId, setChallengeId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [acceptUrl, setAcceptUrl] = useState('')
  const {token} = useAuth();

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (challengeId) {
      intervalId = setInterval(async () => {
        try {
          const response = await fetch(`https://lichess.org/api/challenge/${challengeId}/show`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`
            }
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const challenge = await response.json()
          console.log("challenge:", challenge)
          if (challenge.status === 'accepted') {
            clearInterval(intervalId)
            router.push(`/${challengeId}`)
          }
        } catch (error) {
          console.error('Error checking challenge status:', error)
        }
      }, 1000)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [challengeId, router, token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch(`https://lichess.org/api/challenge/${username}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: "color=white"
        }
      )
      const challenge = await res.json()
      setChallengeId(challenge.id)
      setChallengeUrl(challenge.url)
      if(!challenge.url) throw new Error('Failed to create challenge')
      toast.success("Challenge created!")
    } catch (error) {
      toast.error("Failed to create challenge. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(challengeUrl)
      toast.success("Challenge URL copied to clipboard.")
    } catch (error) {
      toast.error("Failed to copy URL. Please try again.")
    }
  }

  const handleAcceptChallenge = async () => {
    if (!acceptUrl) {
      toast.error("Please enter a challenge URL.")
      return
    }

    setIsLoading(true)
    try {
      const challengeId = acceptUrl.split('/').pop()
      if (!challengeId) throw new Error('Invalid challenge URL')

      const response = await fetch(`https://lichess.org/api/challenge/${challengeId}/accept`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (result.ok) {
        toast.success("Challenge accepted!")
        router.push(`/${challengeId}`)
      } else {
        throw new Error('Failed to accept challenge')
      }
    } catch (error) {
      toast.error("Failed to accept challenge. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Chess Challenge</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Opponent&apos;s Username
            </label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter Lichess username"
              required
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating challenge..." : "Create Challenge"}
          </Button>
        </form>

        {challengeUrl && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg break-all">
              <p className="text-sm font-mono">{challengeUrl}</p>
            </div>
            <Button onClick={copyToClipboard} variant="outline" className="w-full">
              Copy Challenge URL
            </Button>
          </div>
        )}

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="acceptUrl" className="text-sm font-medium">
              Accept Challenge URL
            </label>
            <Input
              id="acceptUrl"
              value={acceptUrl}
              onChange={(e) => setAcceptUrl(e.target.value)}
              placeholder="Enter challenge URL to accept"
            />
          </div>
          <Button 
            onClick={handleAcceptChallenge} 
            disabled={isLoading || !acceptUrl} 
            className="w-full"
          >
            {isLoading ? "Accepting challenge..." : "Accept Challenge"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

