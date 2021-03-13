import React from "react"
import Game from "../components/game"
import "./game-page.scss"

export default class GamePage extends React.PureComponent{
    render(){
        return (
            <div className="game-page-container">
                <Game socket={this.props.socket} broadcastGame />
            </div>
        )
    }
}