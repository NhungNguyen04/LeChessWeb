"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { io, Socket } from "socket.io-client"
import { DiamondIcon as ChessIcon, BotIcon, Users, Radio } from 'lucide-react'

class ClientSocket {
  private socket: Socket;

  constructor() {
    this.socket = io("http://localhost:4000");
    this.initialize();
  }

  private initialize() {
    this.socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    // Additional event handlers would go here
  }

  // Additional methods would go here
}

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuth();

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const connectSocket = () => {
    const clientSocket = new ClientSocket();
    console.log(clientSocket);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-8 flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-xl border-none bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <ChessIcon className="h-8 w-8 text-indigo-600" />
            Chess Portal
          </CardTitle>
          <CardDescription className="text-lg">Choose your game mode</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Button 
              size="lg" 
              className="h-32 text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 ease-in-out transform hover:scale-105"
              onClick={() => router.push("/playAI")}
            >
              <div className="flex flex-col items-center gap-3">
                <BotIcon className="h-10 w-10" />
                <span>Play with LiChess AI</span>
              </div>
            </Button>
            <Button 
              size="lg"
              className="h-32 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-300 ease-in-out transform hover:scale-105"
              onClick={() => router.push("/playFriend")}
            >
              <div className="flex flex-col items-center gap-3">
                <Users className="h-10 w-10" />
                <span>Play with a friend from LiChess</span>
              </div>
            </Button>
          </div>
          <Button 
            variant="outline" 
            className="w-full h-16 text-lg font-semibold border-2 border-purple-500 text-purple-700 hover:bg-purple-50 transition-all duration-300 ease-in-out"
            onClick={connectSocket}
          >
            <Radio className="h-6 w-6 mr-2" />
            Connect to Socket
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

