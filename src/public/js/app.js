const frontSocket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");

  function backendDone(msg) {
    console.log(`The backend says: `, msg);
  }

  frontSocket.emit(
    "enter_room",
    input.value,
    { payload: input.value },
    backendDone
  );  
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);
