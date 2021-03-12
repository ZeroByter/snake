import React from 'react';
import ReactDOM from 'react-dom';
import App from './pages/App';

const socket = io()

window.cheat = (password, type, value) => {
    socket.emit("cheats", password, type, value)
}

socket.on("getId", id => {
    console.log("Connected to Socket.IO server! Our id is:", id)
})

ReactDOM.render(<App socket={socket} />, document.getElementById('root'));