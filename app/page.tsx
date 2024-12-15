"use client"
import { Button } from "@/components/ui/button.tsx";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { io, Socket } from "socket.io-client";

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

    // ...additional event handlers...
  }

  // ...additional methods if needed...
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
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-4 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gray-100">
      <Button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 mb-4" onClick={() => router.push("/playAI")}>Play with AI</Button>
      <Button className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700">Play with Friends</Button>
      <Button className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-700" onClick={connectSocket}>Connect to Socket</Button>
    </div>
  );
}
