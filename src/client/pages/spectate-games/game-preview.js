import React from "react"
import "./game-preview.scss"
import Game from "../../components/game"

export default class GamePreview extends React.Component {
    render() {
        return (
            <a href={"#/watch/" + this.props.gameId}>
                <div className="game-preview">
                    <Game viewGame={this.props.getGameData} viewGameId={this.props.gameId} />
                    <div className="info">
                        Click to view this game in fullscreen!
                    </div>
                </div>
            </a>
        )
    }
}