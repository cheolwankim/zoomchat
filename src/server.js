import http from "http";
import express from "express";
import SocketIo from "socket.io";

const app = express();

app.set("view engine", "pug"); //엔진을 pug로 설정
app.set("views", __dirname + "/views"); // pug파일 있는 폴더
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIo(httpServer);

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

const handleListen = () => console.log(`Listening on http://localhost:3000`);

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (backSocket) => {
  backSocket["nickname"] = "Annon";
  backSocket.onAny((event) => {
    console.log(`Socket Event:${event}`);
  });
  backSocket.on("enter_room", (roomName, done) => {
    backSocket.join(roomName); //join room
    done();
    backSocket
      .to(roomName)
      .emit("welcome", backSocket.nickname, countRoom(roomName));
    wsServer.sockets.emit("room_change", publicRooms());
  });
  backSocket.on("disconnecting", () => {
    backSocket.rooms.forEach((room) =>
      backSocket.to(room).emit("bye", backSocket.nickname, countRoom(room) - 1)
    );
  });
  backSocket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });
  backSocket.on("new_message", (msg, room, done) => {
    backSocket.to(room).emit("new_message", `${backSocket.nickname}: ${msg}`);
    done();
  });
  backSocket.on("nickname", (nickname) => (backSocket["nickname"] = nickname));
});

httpServer.listen(3000, handleListen);
