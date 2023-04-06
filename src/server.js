import http from "http";
import WebSocket from "ws";

import express from "express";

const app = express();

app.set("view engine", "pug"); //엔진을 pug로 설정
app.set("views", __dirname + "/views"); // pug파일 있는 폴더
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sockets = [];

wss.on("connection", (backSocket) => {
  sockets.push(backSocket); //firefox, IE, Chrome
  backSocket["nickname"] = "Anon"; //기본은 Anon
  console.log("connected to browser");
  backSocket.on("close", () => console.log("disconnected from broswser"));
  backSocket.on("message", (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) =>
          aSocket.send(`${backSocket.nickname}: ${message.payload}`)
        );
        break;
      case "nickname":
        backSocket["nickname"] = message.payload;
        break;
    }
  });
});

server.listen(3000, handleListen);
