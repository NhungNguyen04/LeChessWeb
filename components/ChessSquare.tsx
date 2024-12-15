import { Square } from 'chess.js'

interface ChessSquareProps {
  square: string
  piece: Square | null
  isLight: boolean
  onClick: () => void
  isSelected: boolean
}

export default function ChessSquare({ square, piece, isLight, onClick, isSelected }: ChessSquareProps) {
  const getPieceSymbol = (piece: Square | null) => {
    if (!piece) return null
    const symbols: { [key: string]: string } = {
      p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
      P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔'
    }
    return symbols[piece]
  }

  return (
    <div 
      className={`
        w-12 h-12 flex items-center justify-center text-3xl cursor-pointer
        ${isLight ? 'bg-amber-200' : 'bg-amber-800'}
        ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}
      `}
      onClick={onClick}
    >
      {getPieceSymbol(piece)}
    </div>
  )
}

