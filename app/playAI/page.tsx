'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

interface AIOpponent {
  id: string
  name: string
}

export default function LichessAIGame() {
  const [aiOpponents, setAiOpponents] = useState<AIOpponent[]>([])
  const [selectedAI, setSelectedAI] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const {isAuthenticated, user, token, openStream} = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchAIOpponents()
    console.log(user);
  }, [])

  
  const fetchAIOpponents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('https://lichess.org/api/bot/online?nb=5')
      if (!response.ok) {
        throw new Error('Failed to fetch AI opponents')
      }
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      const aiOpponents: AIOpponent[] = []

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.trim()) {
            const bot = JSON.parse(line)
            aiOpponents.push({ id: bot.id, name: bot.username })
          }
        }
      }

      setAiOpponents(aiOpponents)
    } catch (err) {
      setError('Error fetching AI opponents. Please try again.')
      console.error("error", err)
    } finally {
      setLoading(false)
    }
  }

  const startGame = async () => {
    if (!token) { // Use auth.getToken() if necessary
      setError('Authentication token is missing. Please log in again.');
      console.error('Token is null:', token);
      return;
    }

    if (!selectedAI) {
      setError('Please select an AI opponent');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Starting game with token:',token);
      const response = await fetch('https://lichess.org/api/challenge/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token}` // Ensure token is available
        },
        body: `level=1&color=white&opponent=${selectedAI}`
      });
      if (!response.ok) {
        throw new Error('Failed to start game');
      }
      const data = await response.json();
      console.log(data);
      router.push(`/playAI/${data.id}`)
    } catch (err) {
      setError('Error starting the game. Please try again.');
      console.error('Start game error:', err);
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Play Lichess AI</h1>
      <div className="space-y-4">
        <Select onValueChange={setSelectedAI} disabled={loading}>
          <SelectTrigger>
            <SelectValue placeholder="Select an AI opponent" />
          </SelectTrigger>
          <SelectContent>
            {aiOpponents.map((ai) => (
              <SelectItem key={ai.id} value={ai.id}>
                {ai.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={startGame} disabled={!selectedAI || loading}>
          {loading ? 'Starting game...' : 'Start Game'}
        </Button>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  )
}

