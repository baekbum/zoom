import http from "http";
import express from "express";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui"

const app = express();
const port = 3000;

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const server = http.createServer(app);
const handleListen = () => console.log(`Listening on http://localhost:${port}`);
server.listen(port, handleListen);

const io = new Server(server, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true
  }
});

instrument(io, {
  auth: false
});

const publicRooms = () => {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = io;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
};

const countRoom = (roomName) => {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

io.on("connection", (socket) => {
  socket["nick"] = "unknown";
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });

  socket.on("enter_room", (roomName, callback) => {
    socket.join(roomName);
    callback();
    socket.to(roomName).emit("welcome", socket.nick, countRoom(roomName));
    io.sockets.emit("room_change", publicRooms());
  });

  socket.on("nick", (nickName) => {
    socket["nick"] = nickName;
  });

  socket.on("req_message", (msg, roomName, callback) => {
    socket.to(roomName).emit("res_message", `${socket.nick}: ${msg}`);
    callback();
  })

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nick, countRoom(room) - 1));
  });

  socket.on("disconnect", () => {
    io.sockets.emit("room_change", publicRooms());
  });
});