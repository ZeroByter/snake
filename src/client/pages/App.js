import React from "react"
import Game from "../components/game"
import "./app.scss"

export default class App extends React.Component {
	render() {
		return (
			<div className="main-page">
				<Game />
			</div>
		)
	}
}