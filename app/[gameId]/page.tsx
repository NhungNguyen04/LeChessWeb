"use client"

import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
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
  const [currentTurn, setCurrentTurn] = useState<string>(game.turn() === "w" ? "White" : "Black");
  const [whitePlayer, setWhitePlayer] = useState<string>("");
  const [blackPlayer, setBlackPlayer] = useState<string>("");

  useEffect(() => {
    const handler = (msg: any) => {
      console.log(msg);

      if (msg.type === "gameFull") {
        setWhitePlayer(msg.white.name);
        setBlackPlayer(
          msg.black.aiLevel ? `AI Level ${msg.black.aiLevel}` : msg.black.name
        );
      }

      if (msg.type === "gameState" && msg.moves) {
        const moves = msg.moves.split(" ");
        const lastMove = moves[moves.length - 1];

        game.move({
          from: lastMove.slice(0, 2),
          to: lastMove.slice(2, 4)
        });

        setGamePosition(game.fen());
        setCurrentTurn(game.turn() === "w" ? "White" : "Black");

        // Post the black move to our API
        if (game.turn() === 'w') { // If it's white's turn, black just moved
          fetch('/api/moves', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ move: lastMove, color: 'black' })
          });
        }
      }
    };

    openStream(
      `/api/board/game/stream/${gameId}`,
      { headers: { Authorization: `Bearer ${localStorage.getItem("lichess_token")}` } },
      handler
    );
  }, [gameId, openStream, game]);

  useEffect(() => {
    const checkForWhiteMove = async () => {
      // Only fetch if it's White's turn
      if (game.turn() !== "w") return;

      const response = await fetch("/api/moves?color=white");
      const data = await response.json();

      if (data.move && game.turn() === "w") {
        const from = data.move.slice(0, 2);
        const to = data.move.slice(2, 4);

        const move = game.move({
          from,
          to
        });

        if (move !== null) {
          setGamePosition(game.fen());
          setHighlightSquares({});
          setCurrentTurn(game.turn() === "w" ? "White" : "Black");

          fetchBody(`/api/board/game/${gameId}/move/${move.from}${move.to}`, {
            method: "post",
            headers: { Authorization: `Bearer ${localStorage.getItem("lichess_token")}` },
          })
            .then((response) => {
              console.log("Posted White move to Lichess:", response);
            })
            .catch((error) => {
              console.error("Error posting White move to Lichess:", error);
            });
        }
      }
    };

    const interval = setInterval(checkForWhiteMove, 1000);
    return () => clearInterval(interval);
  }, [game, gameId, fetchBody]);

  function findBestMove() {
    // Implement your move suggestion logic here
  }

  function onDrop(sourceSquare: any, targetSquare: any, piece: any) {
    // This function is now only for manual moves, which should not be allowed
    // as the physical board (ESP32) is making the moves
    alert("Moves should be made on the physical board.");
    return false;
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
        <Button
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded"
          onClick={findBestMove}
        >
          Suggest move
        </Button>
      </div>
      <p className="text-md font-bold mt-2 p-2 bg-white rounded shadow">{whitePlayer}</p>
      <p className="mt-4 text-lg font-bold">{currentTurn}'s turn</p>
    </div>
  );
}

