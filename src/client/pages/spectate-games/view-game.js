import React from "react"
import vector2 from "../../classes/vector2"
import Game from "../../components/game"
import "./view-game.scss"

export default class ViewGame extends React.PureComponent {
    game = {
        score: 0,
        head: { location: new vector2() },
        parts: [],
        foods: []
    }

    componentDidMount() {
        this.props.socket.emit("watch-game", this.props.gameId)

        this.props.socket.on("game-data", data => {
            this.game = data
        })
    }

    componentWillUnmount() {
        this.props.socket.emit("stop-watching-game")
    }

    getGameData = () => {
        return this.game
    }

    render() {
        return (
            <div className="view-game-page">
                <Game viewGame={this.getGameData} viewGameId={this.props.gameId} />
            </div>
        )
    }
}