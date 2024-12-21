"use client"
import { Chessboard } from "react-chessboard";
import { Chess } from 'chess.js';
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function PlayAIScreen() {
  const { fetchBody, openStream } = useAuth();
  const { gameId } = useParams();
  const game = useMemo(() => new Chess(), []);
  const [gamePosition, setGamePosition] = useState(game.fen());
  const [highlightSquares, setHighlightSquares] = useState<{ [square: string]: string }>({});
  const [currentTurn, setCurrentTurn] = useState<string>(game.turn() === 'w' ? 'White' : 'Black');
  const [whitePlayer, setWhitePlayer] = useState<string>("");
  const [blackPlayer, setBlackPlayer] = useState<string>("");

  useEffect(() => {
    const handler = (msg: any) => {
      console.log(msg);
      if (msg.type === "gameFull") {
        setWhitePlayer(msg.white.name);
        setBlackPlayer(msg.black.aiLevel ? `AI Level ${msg.black.aiLevel}` : msg.black.name);
      }
      if (msg.type === "gameState" && msg.moves.split(" ").length % 2 === 0) {
        const moves = msg.moves.split(" ");
        const lastMove = moves[moves.length - 1];
        game.move({
          from: lastMove.slice(0, 2),
          to: lastMove.slice(2, 4),
          promotion: "q",
        });
        setGamePosition(game.fen());
        setCurrentTurn(game.turn() === 'w' ? 'White' : 'Black');
      }
    };
    openStream(
      `/api/board/game/stream/${gameId}`,
      { headers: { Authorization: `Bearer ${localStorage.getItem("lichess_token")}` } },
      handler
    );
  }, [gameId, openStream]);

  function findBestMove() {
    // engine.evaluatePosition(game.fen());
    // console.log("engine", engine);

    // engine.onMessage(({ bestMove }) => {
    //   if (bestMove) {
    //     const from = bestMove.slice(0, 2);
    //     const to = bestMove.slice(2, 4);
    //     setHighlightSquares({
    //       [from]: "rgba(255, 255, 0, 0.4)", // Highlight from square
    //       [to]: "rgba(255, 255, 0, 0.4)",   // Highlight to square
    //     });
    //   }
    // });
  }

  function onDrop(sourceSquare: any, targetSquare: any, piece: any) {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      // Add promotion key only if it's a pawn reaching the last rank
      promotion:
        game.get(sourceSquare)?.type === "p" &&
        (targetSquare[1] === "1" || targetSquare[1] === "8")
          ? "q" // Default to queen promotion
          : undefined,
    });

    // Illegal move
    if (move === null) {
      alert("Invalid move!");
      return false;
    }

    // Update the board state
    setGamePosition(game.fen());
    setHighlightSquares({}); // Clear highlights
    setCurrentTurn(game.turn() === 'w' ? 'White' : 'Black');

    // Send the move to the server
    fetchBody(`/api/board/game/${gameId}/move/${move.from}${move.to}`, {
      method: 'post',
      headers: { Authorization: `Bearer ${localStorage.getItem("lichess_token")}` }
    })
      .then(response => {
        console.log("response", response);
      })
      .catch(error => {
        console.error("Error:", error);
      });

    if (piece?.startsWith("b")) {
      // socket.emit("move", { from: sourceSquare, to: targetSquare, color: "b" });
    }

    return true;
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <p className="text-md font-bold mb-2 p-2 bg-white rounded shadow">{blackPlayer}</p>
      <div className="w-1/3 h-auto bg-white p-4 rounded shadow">
        <Chessboard 
          id="PlayVsBot" 
          position={gamePosition} 
          onPieceDrop={onDrop} 
          customSquareStyles={highlightSquares} 
        />
        <Button className="mt-4 w-full bg-blue-500 text-white py-2 rounded" onClick={findBestMove}>Suggest move</Button>
      </div>
      <p className="text-md font-bold mt-2 p-2 bg-white rounded shadow">{whitePlayer}</p>
      <p className="mt-4 text-lg font-bold">{currentTurn}'s turn</p>
    </div>
  );
}