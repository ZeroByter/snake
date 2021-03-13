import React from "react"
import GamePreview from "./game-preview"
import "./view-games.scss"

export default class ViewGames extends React.Component {
    state = {
        games: {}//JSON.parse(atob("eyJjOEZVRmEiOnsiaGVhZCI6eyJsb2NhdGlvbiI6eyJ4Ijo4NDAsInkiOjQ1My41fSwicGFyZW50IjpudWxsfSwicGFydHMiOlt7InBhcmVudCI6eyJsb2NhdGlvbiI6eyJ4Ijo4NDAsInkiOjQ1My41fSwicGFyZW50IjpudWxsfSwibG9jYXRpb24iOnsieCI6LTAuMDM4NjQwNzc2NjA5NTY2NDQsInkiOi0wLjUxNjk0NDM1ODQ1MDMyMDJ9fSx7InBhcmVudCI6eyJwYXJlbnQiOnsibG9jYXRpb24iOnsieCI6ODQwLCJ5Ijo0NTMuNX0sInBhcmVudCI6bnVsbH0sImxvY2F0aW9uIjp7IngiOi0wLjAzODY0MDc3NjYwOTU2NjQ0LCJ5IjotMC41MTY5NDQzNTg0NTAzMjAyfX0sImxvY2F0aW9uIjp7IngiOi0wLjYzMTkwNDA1NzMzNzUzMDMsInkiOi0wLjMwMjAzMjc2MTI3NjgxOX19LHsicGFyZW50Ijp7InBhcmVudCI6eyJwYXJlbnQiOnsibG9jYXRpb24iOnsieCI6ODQwLCJ5Ijo0NTMuNX0sInBhcmVudCI6bnVsbH0sImxvY2F0aW9uIjp7IngiOi0wLjAzODY0MDc3NjYwOTU2NjQ0LCJ5IjotMC41MTY5NDQzNTg0NTAzMjAyfX0sImxvY2F0aW9uIjp7IngiOi0wLjYzMTkwNDA1NzMzNzUzMDMsInkiOi0wLjMwMjAzMjc2MTI3NjgxOX19LCJsb2NhdGlvbiI6eyJ4IjotMC41MTc5MDIyNzU1NjMyNDc2LCJ5IjotMC41NzgxMzYxODkxNTQwNDU1fX1dLCJmb29kcyI6W3sibG9jYXRpb24iOnsieCI6MTQyMy4wNzA3MTI2NzI2OTgsInkiOjQxNC4wOTIzOTE5MjE4MDg3N30sImV4cGlyYXRpb24iOjB9XSwic2NvcmUiOjAsImNhbnZhc1dpZHRoIjoxNjgwLCJjYW52YXNIZWlnaHQiOjkwN30sInRlc3R0Ijp7ImhlYWQiOnsibG9jYXRpb24iOnsieCI6ODQwLCJ5Ijo0NTMuNX0sInBhcmVudCI6bnVsbH0sInBhcnRzIjpbeyJwYXJlbnQiOnsibG9jYXRpb24iOnsieCI6ODQwLCJ5Ijo0NTMuNX0sInBhcmVudCI6bnVsbH0sImxvY2F0aW9uIjp7IngiOi0wLjAzODY0MDc3NjYwOTU2NjQ0LCJ5IjotMC41MTY5NDQzNTg0NTAzMjAyfX0seyJwYXJlbnQiOnsicGFyZW50Ijp7ImxvY2F0aW9uIjp7IngiOjg0MCwieSI6NDUzLjV9LCJwYXJlbnQiOm51bGx9LCJsb2NhdGlvbiI6eyJ4IjotMC4wMzg2NDA3NzY2MDk1NjY0NCwieSI6LTAuNTE2OTQ0MzU4NDUwMzIwMn19LCJsb2NhdGlvbiI6eyJ4IjotMC42MzE5MDQwNTczMzc1MzAzLCJ5IjotMC4zMDIwMzI3NjEyNzY4MTl9fSx7InBhcmVudCI6eyJwYXJlbnQiOnsicGFyZW50Ijp7ImxvY2F0aW9uIjp7IngiOjg0MCwieSI6NDUzLjV9LCJwYXJlbnQiOm51bGx9LCJsb2NhdGlvbiI6eyJ4IjotMC4wMzg2NDA3NzY2MDk1NjY0NCwieSI6LTAuNTE2OTQ0MzU4NDUwMzIwMn19LCJsb2NhdGlvbiI6eyJ4IjotMC42MzE5MDQwNTczMzc1MzAzLCJ5IjotMC4zMDIwMzI3NjEyNzY4MTl9fSwibG9jYXRpb24iOnsieCI6LTAuNTE3OTAyMjc1NTYzMjQ3NiwieSI6LTAuNTc4MTM2MTg5MTU0MDQ1NX19XSwiZm9vZHMiOlt7ImxvY2F0aW9uIjp7IngiOjE0MjMuMDcwNzEyNjcyNjk4LCJ5Ijo0MTQuMDkyMzkxOTIxODA4Nzd9LCJleHBpcmF0aW9uIjowfV0sInNjb3JlIjowLCJjYW52YXNXaWR0aCI6MTY4MCwiY2FudmFzSGVpZ2h0Ijo5MDd9fQ=="))
    }

    componentDidMount() {
        this.props.socket.emit("watch-games-list")
        this.props.socket.on("watch-games-list", () => {
            this.props.socket.emit("get-games-list")
            this.props.socket.on("get-games-list", data => {
                this.setState({ games: data })
            })
        })
    }

    componentWillUnmount() {
        this.props.socket.emit("stop-watch-games-list")
    }

    getGameData = gameId => {
        return this.state.games[gameId]
    }

    render() {
        let games = Object.entries(this.state.games).map(entry => {
            const gameId = entry[0]

            return <GamePreview key={gameId} gameId={gameId} getGameData={this.getGameData} />
        })

        return (
            <div className="view-games-page middle-page-container">
                <div className="header">
                    <a href="#/"><button className="button">main menu</button></a>
                    <h3>Welcome to the Snekky Snekky games TV!</h3>
                    <h4>Click on any game to spectate it!</h4>
                </div>
                <div className="games">
                    {games}
                </div>
            </div>
        )
    }
}