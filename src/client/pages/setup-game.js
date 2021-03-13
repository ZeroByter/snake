import React from "react"
import "./setup-game.scss"

export default class SetupGame extends React.Component {
    state = {
        exponentialGrowth: true,
        exponentialGrowthMultiplier: 1
    }

    handleExponentialGrowthChange = e => {
        this.setState({ exponentialGrowth: e.target.checked })
    }

    handleExponentialGrowthMultiplierChange = e => {
        this.setState({ exponentialGrowthMultiplier: e.target.value })
    }

    handleStartGame = () => {
        localStorage.setItem("game-settings", JSON.stringify(this.state))
    }

    render() {
        let exponentialGrowthSettings = null
        if (this.state.exponentialGrowth) {
            exponentialGrowthSettings = (
                <div>
                    <label htmlFor="exponentialGrowthMultiplier">exponential growth multiplier: </label>
                    <br />
                    <input id="exponentialGrowthMultiplier" type="number" value={this.state.exponentialGrowthMultiplier} onChange={this.handleExponentialGrowthMultiplierChange} />
                </div>
            )
        }

        return (
            <div className="setup-game-page fill-screen">
                <div className="buttons-container">
                    <div>
                        <label htmlFor="toggleExponentialGrowth">exponential growth?</label>
                        <input id="toggleExponentialGrowth" type="checkbox" checked={this.state.exponentialGrowth} onChange={this.handleExponentialGrowthChange} />
                    </div>
                    {exponentialGrowthSettings}
                    <div className="bottom-buttons">
                        <a href="#/"><button className="button">main menu</button></a>
                        <a href="#/game"><button className="button" onClick={this.handleStartGame}>start!</button></a>
                    </div>
                </div>
            </div>
        )
    }
}