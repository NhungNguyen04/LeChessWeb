'use client'

import { useState, useCallback } from 'react'
import { Chess } from 'chess.js'
import ChessBoard from './ChessBoard'
import { Button } from "@/components/ui/button"

export default function ChessGame() {
  const [game, setGame] = useState(new Chess())
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)

  const handleSquareClick = useCallback((square: string) => {
    if (selectedSquare === null) {
      setSelectedSquare(square)
    } else {
      try {
        game.move({
          from: selectedSquare,
          to: square,
          promotion: 'q' // Always promote to queen for simplicity
        })
        setGame(new Chess(game.fen()))
        setSelectedSquare(null)
      } catch (e) {
        // Invalid move
        setSelectedSquare(square)
      }
    }
  }, [selectedSquare, game])

  const resetGame = useCallback(() => {
    setGame(new Chess())
    setSelectedSquare(null)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Chess Game</h1>
      <ChessBoard 
        position={game.board().map(row => row.map(square => square ? square.square : null))} 
        onSquareClick={handleSquareClick}
        selectedSquare={selectedSquare}
      />
      <div className="mt-4">
        <p className="text-lg mb-2">
          {game.isGameOver() 
            ? `Game Over: ${game.isCheckmate() ? 'Checkmate!' : 'Draw!'}`
            : `Current turn: ${game.turn() === 'w' ? 'White' : 'Black'}`
          }
        </p>
        <Button onClick={resetGame}>Reset Game</Button>
      </div>
    </div>
  )
}

