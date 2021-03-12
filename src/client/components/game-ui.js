import React from "react"
import "./game-ui.scss"

export default class GameUI extends React.Component {
    state = {
        pauseContinueCountdown: 0
    }

    pauseContinueStartTime = 0
    pauseContinueCountdownInterval = 0

    componentWillUnmount(){
        clearInterval(this.pauseContinueCountdownInterval)
    }

    handlePauseContinueMouseEnter = () => {
        this.pauseContinueStartTime = new Date().getTime()
        this.pauseContinueCountdownInterval = setInterval(() => {
            let timeLeft = this.pauseContinueStartTime + 1500 - new Date().getTime()

            if(timeLeft < 0){
                this.props.continueGame()
            }else{
                this.setState({
                    pauseContinueCountdown: timeLeft
                })
            }
        }, 50)
    }

    handlePauseContinueMouseLeave = () => {
        clearInterval(this.pauseContinueCountdownInterval)
    }

    render() {
        return (
            <div className="game-ui">
                <div className="score">{this.props.gameData.score}</div>
                <div className="pause-screen" style={{ display: this.props.gameData.paused ? "" : "none" }}>
                    <div>Paused!</div>
                    <div>Put your cursor on the highlighted area to continue!</div>
                    <div className="pause-continue-countdown">{+(this.state.pauseContinueCountdown / 1000).toFixed(1)}</div>
                    <div className="pause-continue-highlighted-area" style={{ left: this.props.gameData.head.location.x, top: this.props.gameData.head.location.y }} onMouseEnter={this.handlePauseContinueMouseEnter} onMouseLeave={this.handlePauseContinueMouseLeave} ></div>
                </div>
                <div className="death-screen" style={{ display: this.props.gameData.isDead ? "" : "none" }}>
                    <div className="score">Score: {this.props.gameData.score}</div>
                    <div className="moved-distance">You moved {Math.round(this.props.gameData.metersMoved / 1000)} meters</div>
                    <div><button>Retry</button></div>
                    <div><button>Main Menu</button></div>
                </div>
            </div>
        )
    }
}