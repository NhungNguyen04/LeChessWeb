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
        methods: ["GET", "POST"]
      }
    });
    this.initialize();
  }

  private initialize() {
    this.io.on("connection", (socket) => {
      console.log("a user connected");

      socket.on("disconnect", () => {
        console.log("user disconnected");
      });

      socket.on("move", (move) => {
        if (move.color === "b") {
          socket.broadcast.emit("opponentMove", move);
        }
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