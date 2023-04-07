const frontSocket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

const room = document.getElementById("room");
room.hidden = true;
let roomName;

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  frontSocket.emit("new_message", input.value, roomName, () => {
    addmessage(`You: ${value}`);
  });
  input.value = "";
}

function handleNickNameSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#name input");
  const value = input.value;
  frontSocket.emit("nickname", input.value);
}

frontSocket.on("new_message", addmessage);

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;

  const nameForm = room.querySelector("#name");

  const msgForm = room.querySelector("#msg");
  msgForm.addEventListener("submit", handleMessageSubmit);
  nameForm.addEventListener("submit", handleNickNameSubmit);
}

function addmessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

frontSocket.on("welcome", (user, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addmessage(`${user} arrived`);
});

frontSocket.on("bye", (left, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addmessage(`${left} left`);
});

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  roomName = input.value;
  frontSocket.emit("enter_room", input.value, showRoom);
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

frontSocket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});
