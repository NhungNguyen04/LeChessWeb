import { Square } from 'chess.js'
import ChessSquare from './ChessSquare'

interface ChessBoardProps {
  position: (Square | null)[][]
  onSquareClick: (square: string) => void
  selectedSquare: string | null
}

export default function ChessBoard({ position, onSquareClick, selectedSquare }: ChessBoardProps) {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1']

  return (
    <div className="grid grid-cols-8 gap-0 border-2 border-gray-800">
      {ranks.map((rank, rankIndex) =>
        files.map((file, fileIndex) => {
          const square = `${file}${rank}`
          const piece = position[rankIndex][fileIndex]
          const isSelected = square === selectedSquare
          return (
            <ChessSquare
              key={square}
              square={square}
              piece={piece}
              isLight={(rankIndex + fileIndex) % 2 === 0}
              onClick={() => onSquareClick(square)}
              isSelected={isSelected}
            />
          )
        })
      )}
    </div>
  )
}

