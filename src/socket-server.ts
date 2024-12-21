import { Server } from "socket.io";
import http from "http";

class SocketServer {
  private io: Server;
  private server: http.Server;

  constructor() {
    this.server = http.createServer();
    this.io = new Server(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true
      }
    });
    this.initialize();
  }

  private initialize() {
    this.io.on("connection", (socket) => {
      console.log("a user connected", socket.id);

      socket.on("disconnect", () => {
        console.log("user disconnected");
      });

      socket.on("opponentMove", (move) => {
        socket.broadcast.emit("opponentMove", move);
      });

      socket.on("whiteMove", (move) => {
        console.log("Received whiteMove from client:", move); // <--- ADD LOG
        socket.broadcast.emit("whiteMove", move);
      });
      

      // ...additional event handlers...
    });

    const PORT = process.env.SOCKET_PORT || 4000;
    this.server.listen(PORT, () => {
      console.log(`Socket.IO server running at http://localhost:${PORT}/`);
    });
  }

  // ...additional methods if needed...
}

export default SocketServer;