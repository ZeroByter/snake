import React from "react"
import "./main-menu.scss"

export default class MainMenu extends React.Component {
    handleQuickGame = () => {
        const settings = {
            exponentialGrowth: true,
            exponentialGrowthMultiplier: 1
        }

        localStorage.setItem("game-settings", JSON.stringify(settings))
    }
    
    render() {
        return (
            <div className="main-menu-page fill-screen">
                <div className="buttons-container">
                    <a href="#/game"><button className="button" onClick={this.handleQuickGame}>quick game</button></a>
                    <a href="#/setup-game"><button className="button">play game</button></a>
                    <a href="#/watch"><button className="button">watch games</button></a>
                    <a href="#/about"><button className="button">about</button></a>
                </div>
            </div>
        )
    }
}