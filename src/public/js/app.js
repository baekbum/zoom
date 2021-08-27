const socket = new WebSocket(`ws://${window.location.host}`);
const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");

const handleOpen = (config) => {
    console.log("Connected to Server");
};

const handleClose = (config) => {
    console.log("Disconnected from Server");
};

socket.addEventListener("open", handleOpen);

socket.addEventListener("close", handleClose);

socket.addEventListener("message", (message) => {
    console.log(message);
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
});

const makeMessage = (type, payload) => {
    const msg = { type, payload };
    return JSON.stringify(msg);
};

const handleSubmit = (event) => {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
    input.value = "";
}

const handleNickSubmit = (event) => {
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
}
  
messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);