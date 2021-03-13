const express = require('express');
const { randomString } = require('../shared/essentials');
const app = express();

const http = require("http").Server(app)
const io = require("socket.io")(http)
// const mysql = require("mysql");

const isDev = process.env.NODE_ENV !== "production"

app.use(express.static('dist'));

//api example
//app.get('/api/getUsername', (req, res) => res.send({ username: os.userInfo().username }));

let sockets = {}
let games = {}

const getGameDataToSend = gameData => {
    return {
        head: gameData.game.head,
        parts: gameData.game.parts,
        foods: gameData.game.foods,
        score: gameData.game.score,
        canvasWidth: gameData.canvasWidth,
        canvasHeight: gameData.canvasHeight
    }
}

setInterval(() => {
    sendGamesList()
}, 1000)
setInterval(() => {
    Object.values(sockets).forEach(socket => {
        if(socket.watchingGame != null && socket.watchingGame in games){
            const game = games[socket.watchingGame]

            socket.socket.emit("game-data", getGameDataToSend(game))
        }
    })
}, 50)

const sendGamesList = target => {
    let games = {}

    Object.values(sockets).forEach(loopSocket => {
        if (loopSocket.currentGame != null) {
            games[loopSocket.currentGame.gameId] = getGameDataToSend(loopSocket.currentGame)
        }
    })

    if (target == null) {
        //sending to all clients watching the game list

        Object.values(sockets).forEach(socket => {
            if (!socket.watchingGamesList) return

            socket.socket.emit("get-games-list", games)
        })
    } else {
        //sending to one specific client

        //we dont check watchingGamesList since we assume that is done somewhere else
        target.emit("get-games-list", games)
    }
}

io.on("connection", socket => {
    socket.emit("getId", socket.id)
    sockets[socket.id] = {
        socket,
        watchingGamesList: false,
        watchingGame: null,
        currentGame: null
    }

    socket.on("watch-games-list", () => {
        sockets[socket.id].watchingGamesList = true

        //relay the packet back to the client so he knows he is now viewing the games list
        socket.emit("watch-games-list")
    })
    socket.on("stop-watch-games-list", () => {
        sockets[socket.id].watchingGamesList = false

        //relay the packet back to the client so he knows he is no longer viewing the games list
        socket.emit("stop-watch-games-list")
    })

    socket.on("watch-game", gameId => {
        sockets[socket.id].watchingGamesList = false
        sockets[socket.id].watchingGame = gameId
    })
    socket.on("stop-watching-game", () => {
        sockets[socket.id].watchingGame = null
    })

    socket.on("start-game", gameData => {
        gameData.gameId = randomString()
        sockets[socket.id].currentGame = gameData

        games[gameData.gameId] = gameData

        sendGamesList()
    })
    socket.on("update-game", gameData => {
        if (sockets[socket.id].currentGame != null) {
            sockets[socket.id].currentGame.canvasWidth = gameData.canvasWidth
            sockets[socket.id].currentGame.canvasHeight = gameData.canvasHeight
            sockets[socket.id].currentGame.game.score = gameData.score
            sockets[socket.id].currentGame.game.head = gameData.head
            sockets[socket.id].currentGame.game.parts = gameData.parts
            sockets[socket.id].currentGame.game.foods = gameData.foods

            games[sockets[socket.id].currentGame.gameId] = sockets[socket.id].currentGame
        }
    })
    socket.on("end-game", () => {
        delete games[sockets[socket.id].currentGame.gameId]
        sockets[socket.id].currentGame = null
    })

    socket.on("get-games-list", () => {
        if (!sockets[socket.id].watchingGamesList) return

        sendGamesList(socket)
    })

    socket.on("disconnect", reason => {
        delete sockets[socket.id]
    })
})

http.listen(process.env.PORT || 8080, () => console.log(`Listening on port ${process.env.PORT || 8080}!`));