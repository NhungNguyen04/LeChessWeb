"use client"
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
// Import Socket.IO client
import { io, Socket } from "socket.io-client";

export default function PlayAIScreen() {
  const { fetchBody, openStream } = useAuth();
  const { gameId } = useParams();
  const game = useMemo(() => new Chess(), []);

  const [gamePosition, setGamePosition] = useState(game.fen());
  const [highlightSquares, setHighlightSquares] = useState<{ [square: string]: string }>({});
  const [currentTurn, setCurrentTurn] = useState<string>(game.turn() === "w" ? "White" : "Black");
  const [whitePlayer, setWhitePlayer] = useState<string>("");
  const [blackPlayer, setBlackPlayer] = useState<string>("");

  const socket: Socket = io("http://localhost:4000");
  useEffect(() => {
    const handler = (msg: any) => {
      console.log(msg);

      if (msg.type === "gameFull") {
        setWhitePlayer(msg.white.name);
        setBlackPlayer(
          msg.black.aiLevel ? `AI Level ${msg.black.aiLevel}` : msg.black.name
        );
      }

      // If there's a new move in gameState and the total moves are even,
      // that typically indicates Black just moved (since White moves first).
      if (msg.type === "gameState" && msg.moves.split(" ").length % 2 === 0) {
        const moves = msg.moves.split(" ");
        const lastMove = moves[moves.length - 1]; // e.g. "e7e5"

        // Apply the black move locally
        game.move({
          from: lastMove.slice(0, 2),
          to: lastMove.slice(2, 4),
          promotion: "q", // simplistic promotion
        });

        // Emit black move to the Pi (raspberry) so it can display it
        socket.emit("opponentMove", lastMove);

        setGamePosition(game.fen());
        setCurrentTurn(game.turn() === "w" ? "White" : "Black");
      }
    };

    openStream(
      `/api/board/game/stream/${gameId}`,
      { headers: { Authorization: `Bearer ${localStorage.getItem("lichess_token")}` } },
      handler
    );
  }, [gameId, openStream, game, socket]);

  /**
   * 2) Listen for White moves from the Raspberry Pi.
   *    - The Pi sends something like "e2e4" as `whiteMove`.
   *    - We apply that move locally and call the Lichess API.
   */
  useEffect(() => {
    socket.on("whiteMove", (moveString: string) => {
      console.log("White move from Pi:", moveString);
      const from = moveString.slice(0, 2);
      const to = moveString.slice(2, 4);

      // Attempt the move locally
      const move = game.move({
        from,
        to,
        promotion: "q",
      });

      if (move === null) {
        console.error("Invalid white move from Pi:", moveString);
        return;
      }

      setGamePosition(game.fen());
      setHighlightSquares({});
      setCurrentTurn(game.turn() === "w" ? "White" : "Black");

      // Send the white move to Lichess
      fetchBody(`/api/board/game/${gameId}/move/${move.from}${move.to}`, {
        method: "post",
        headers: { Authorization: `Bearer ${localStorage.getItem("lichess_token")}` },
      })
        .then((response) => {
          console.log("Posted White move (from Pi) to Lichess:", response);
        })
        .catch((error) => {
          console.error("Error posting White move to Lichess:", error);
        });
    });

    // Cleanup: avoid multiple listeners if the component re-mounts
    return () => {
      socket.off("whiteMove");
    };
  }, [socket, game, gameId, fetchBody]);

  /**
   * 3) Suggest move logic (unchanged)
   */
  function findBestMove() {
    // engine.evaluatePosition(game.fen());
    // console.log("engine", engine);
  }

  /**
   * 4) Local onDrop (for front-end moves if needed)
   *    - If you only want moves from the Pi, you can remove or disable this.
   */
  function onDrop(sourceSquare: any, targetSquare: any, piece: any) {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion:
        game.get(sourceSquare)?.type === "p" &&
        (targetSquare[1] === "1" || targetSquare[1] === "8")
          ? "q"
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
    setCurrentTurn(game.turn() === "w" ? "White" : "Black");

    // Send the move to the server (Lichess) if front-end user is also allowed to move
    fetchBody(`/api/board/game/${gameId}/move/${move.from}${move.to}`, {
      method: "post",
      headers: { Authorization: `Bearer ${localStorage.getItem("lichess_token")}` },
    })
      .then((response) => {
        console.log("response", response);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    return true;
  }

  /**
   * 5) Render
   */
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
