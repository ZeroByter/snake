import React from 'react'
import ReactDOM from 'react-dom'
import { Route, Switch, HashRouter } from "react-router-dom"
import MainMenu from './pages/main-menu'
import GamePage from './pages/game-page'
import "./index.scss"
import "./button.scss"
import SetupGame from './pages/setup-game'
import ViewGames from './pages/spectate-games/view-games'
import ViewGame from './pages/spectate-games/view-game'
import About from './pages/about'

const socket = io()

window.cheat = (password, type, value) => {
    socket.emit("cheats", password, type, value)
}

socket.on("getId", id => {
    console.log("Connected to Socket.IO server! Our id is:", id)
})

ReactDOM.render((
    <HashRouter>
        <Switch>
            <Route path="/game">
                <GamePage socket={socket} />
            </Route>
            <Route path="/setup-game" exact>
                <SetupGame />
            </Route>

            <Route
                path="/watch/:gameId"
                exact
                render={routeProps => {
                    return <ViewGame socket={socket} gameId={routeProps.match.params.gameId} />
                }}
            />
            <Route path="/watch" exact>
                <ViewGames socket={socket} />
            </Route>

            <Route path="/about" exact>
                <About />
            </Route>

            <Route path="/" exact>
                <MainMenu />
            </Route>
        </Switch>
    </HashRouter>
), document.getElementById('root'));