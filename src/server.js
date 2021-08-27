import http from "http";
import WebSocket from "ws";
import express from "express";
const app = express();
const port = 3000;

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const sockets = [];

const handleListen = () => console.log(`Listening on http://localhost:${port}`);

server.listen(port, handleListen);

const wsClose = () => {
    console.log("Disconnected from the Browser");
};

wss.on("connection", (socket) => {
  console.log("Connected to Browser");
  socket["nick"] = "익명"
  sockets.push(socket);
  socket.on("message", (msg) => {
    const message = JSON.parse(msg.toString('utf-8'));
    switch (message.type) {
        case 'new_message':
            sockets.forEach((s) => s.send(`${socket.nick}: ${message.payload}`));
            break;
        case 'nickname':
            socket["nick"] = message.payload;
            break;
        default :
            console.log('defalut');
    }
  });

  socket.on("close", wsClose);
});