import React, { createRef } from "react"
import { lerp } from "../../shared/essentials"
import vector2 from "../classes/vector2"
import GameUI from "./game-ui"
import "./game.scss"

const getPartFromIndex = (gameData, index) => {
	if (index == -1) {
		return gameData.head
	} else {
		return gameData.parts[index]
	}
}

const getNewFood = (width, height) => {
	return {
		location: new vector2(50 + Math.random() * (width - 100), 50 + Math.random() * (height - 100)),
		expiration: 0
	}
}

/**
 * This function has a side-effect!
 * Calling this function and providing a gameData object will automatically add a new player part to that game data!
 * @param {*} gameData The game data
 * @param {number} width width of the canvas
 * @param {number} height height of the canvas
 */
const getAndAddNewPart = (gameData, width, height) => {
	let location = gameData.head.location.copy()
	if (gameData.parts.length != 0) {
		location = gameData.parts[gameData.parts.length - 1].location.copy()
	}

	let placedInMiddleIndex = -1
	if (gameData.parts.length > 3) {
		let index = Math.floor(Math.random() * (gameData.parts.length - 2) + 2)
		placedInMiddleIndex = index
		location = gameData.parts[index - 1].location.copy()
	}

	//randomize starting location
	location = new vector2(location.x + Math.random() * 2 - 1, location.y + Math.random() * 2 - 1)

	const newPart = {
		location
	}
	if (placedInMiddleIndex != -1) {
		gameData.parts.splice(placedInMiddleIndex, 0, newPart)
	} else {
		gameData.parts.push(newPart)
	}
}

const getDefaultGameData = (width, height) => {
	let gameData = {
		paused: false,
		gameStartTime: new Date().getTime(),
		head: {
			location: new vector2()
		},
		parts: [],
		foods: [],
		score: 0,
		isDead: false,
		metersMoved: 0,
		settings: JSON.parse(localStorage.getItem("game-settings"))
	}

	if (width != 0 && height != 0) {
		gameData.foods.push(getNewFood(width, height))

		getAndAddNewPart(gameData, width, height)
		getAndAddNewPart(gameData, width, height)
		getAndAddNewPart(gameData, width, height)
	}

	return gameData
}

let debug = false
let lineSnake = true

export default class Game extends React.Component {
	gameRunning = true
	mouseLocation = new vector2()

	gameData = getDefaultGameData()

	containerRef = createRef()
	canvasRef = createRef()

	physicsInterval = -1
	renderInterval = -1

	getViewGameDataInterval = -1

	componentDidMount() {
		let container = this.containerRef.current
		new ResizeObserver(this.handleContainerResize).observe(container)

		let canvas = this.canvasRef.current

		const getGameDataFromViewGame = () => {
			let gameData = this.props.viewGame(this.props.viewGameId)

			//have to manually initiate this because vector2 is not re-serialized in head
			gameData.head.location = new vector2(gameData.head.location.x, gameData.head.location.y)

			return gameData
		}

		if (this.props.viewGame != null) {
			this.gameData = getGameDataFromViewGame()

			canvas.width = this.gameData.canvasWidth
			canvas.height = this.gameData.canvasHeight

			this.getViewGameDataInterval = setInterval(() => {
				this.gameData = getGameDataFromViewGame()

				this.forceUpdate()
			}, 50)
		} else {
			this.gameData = getDefaultGameData(canvas.width, canvas.height)

			canvas.width = window.innerWidth
			canvas.height = window.innerHeight

			this.gameData.head.location = new vector2(canvas.width / 2, canvas.height / 2)
		}

		let ctx = canvas.getContext("2d")

		const newFood = () => {
			this.gameData.foods.push(getNewFood(canvas.width, canvas.height))
		}

		canvas.addEventListener("mousemove", e => {
			this.mouseLocation = new vector2(e.pageX, e.pageY)
		})

		document.addEventListener("keydown", this.handleDocumentKeyDown)

		let lastHeadPosition = this.gameData.head.location.copy()
		let lastBroadcastGame = new Date().getTime()
		this.physicsInterval = setInterval(() => {
			if (!this.gameRunning) return
			if (this.props.viewGame != null) return

			if (this.props.broadcastGame != null && this.props.socket != null && new Date().getTime() - lastBroadcastGame > 50) {
				lastBroadcastGame = new Date().getTime()
				const socket = this.props.socket

				socket.emit("update-game", {
					canvasWidth: canvas.width,
					canvasHeight: canvas.height,
					score: this.gameData.score,
					head: this.gameData.head,
					parts: this.gameData.parts,
					foods: this.gameData.foods,
				})
			}

			this.gameData.head.location.x = this.mouseLocation.x
			this.gameData.head.location.y = this.mouseLocation.y

			this.gameData.metersMoved += this.gameData.head.location.distance(lastHeadPosition)

			lastHeadPosition = this.gameData.head.location.copy()

			this.gameData.parts.forEach((part, index) => {
				let distanceToHead = part.location.distance(this.gameData.head.location)
				if (new Date().getTime() - this.gameData.gameStartTime > 1000 && index > 0 && distanceToHead > 5 && distanceToHead < 17) {
					this.gameRunning = false
					this.gameData.isDead = true
					this.forceUpdate()
				}

				let parent = getPartFromIndex(this.gameData, index - 1)
				let distance = 25

				if (index != 0) {
					distance = 20
				}

				const direction = part.location.minus(parent.location).normalized()
				this.gameData.parts[index].location = parent.location.add(direction.multiply(distance))
			})

			this.gameData.foods.forEach((food, foodIndex) => {
				if (this.gameData.head.location.distance(food.location) < 18) {
					if (this.gameData.settings.exponentialGrowth) {
						let newPartsCount = Math.max(1, Math.round(this.gameData.parts.length / 10) * this.gameData.settings.exponentialGrowthMultiplier) //comment this/relace this to 1 to disable exponential growth
						for (let i = 0; i < newPartsCount; i++) {
							getAndAddNewPart(this.gameData, canvas.width, canvas.height)
						}
					} else {
						getAndAddNewPart(this.gameData, canvas.width, canvas.height)
					}

					newFood()

					this.gameData.foods.splice(foodIndex, 1)

					this.gameData.score += 1
					this.forceUpdate()
				}
			})
		}, 5)
		if (this.props.viewGame != null) clearInterval(this.physicsInterval)

		let lastRender = 0

		this.renderInterval = setInterval(() => {
			if (!this.gameRunning) {
				if (new Date().getTime() - lastRender < 0.5) return
			}
			lastRender = new Date().getTime()

			ctx.fillStyle = "black"
			ctx.fillRect(0, 0, canvas.width, canvas.height)

			if (lineSnake && !debug) {
				ctx.strokeStyle = "white"
				this.gameData.parts.forEach((part, index) => {
					let parent = getPartFromIndex(this.gameData, index - 1)

					ctx.lineWidth = lerp(12, 4, index / this.gameData.parts.length)
					ctx.beginPath()
					ctx.moveTo(part.location.x, part.location.y)
					ctx.lineTo(parent.location.x, parent.location.y)
					ctx.stroke()
				})
			} else {
				ctx.fillStyle = "white"
				this.gameData.parts.forEach((part, index) => {
					ctx.beginPath()
					ctx.arc(part.location.x, part.location.y, lerp(10, 7.5, index / this.gameData.parts.length), 0, 2 * Math.PI)
					ctx.fill()
				})
			}

			ctx.fillStyle = "red"
			ctx.beginPath()
			ctx.arc(this.gameData.head.location.x, this.gameData.head.location.y, 10, 0, 2 * Math.PI)
			ctx.fill()

			//debug...
			if (debug) {
				ctx.font = '10px serif';
				ctx.strokeStyle = "red"
				ctx.fillStyle = "blue"
				ctx.lineWidth = 2
				this.gameData.parts.forEach((part, index) => {
					let parent = getPartFromIndex(this.gameData, index - 1)

					ctx.beginPath()
					ctx.moveTo(part.location.x, part.location.y)
					ctx.lineTo(parent.location.x, parent.location.y)
					ctx.stroke()

					ctx.fillText(index, part.location.x, part.location.y);
				})
			}

			this.gameData.foods.forEach(food => {
				ctx.fillStyle = `rgba(0,255,0,${1 - food.expiration})`
				ctx.beginPath()
				ctx.arc(food.location.x, food.location.y, 8, 0, 2 * Math.PI)
				ctx.fill()
			})
		}, 10)

		if (this.props.broadcastGame != null && this.props.socket != null) {
			const socket = this.props.socket

			socket.emit("start-game", {
				canvasWidth: canvas.width,
				canvasHeight: canvas.height,
				game: this.gameData
			})
		}
	}

	componentWillUnmount() {
		document.removeEventListener("keydown", this.componentWillUnmount)
		clearInterval(this.physicsInterval)
		clearInterval(this.renderInterval)
		clearInterval(this.getViewGameDataInterval)

		if (this.props.broadcastGame != null && this.props.socket != null) {
			const socket = this.props.socket

			socket.emit("end-game")
		}
	}

	handleDocumentKeyDown = e => {
		if (this.props.viewGame != null) return

		if (e.code === "Space" || e.code === "KeyP" || e.code === "Escape") {
			this.gameRunning = false
			this.gameData.paused = true
			this.forceUpdate()
		}

		if (e.code === "KeyD") {
			debug = !debug
		}

		if (e.code === "KeyL") {
			lineSnake = !lineSnake
		}
	}

	handleContinueGame = () => {
		this.gameRunning = true
		this.gameData.paused = false
		this.forceUpdate()
	}

	handleContainerResize = e => {
		let canvas = this.canvasRef.current
		let rect = e[0].contentRect

		if (canvas != null) {
			if (this.props.viewGame == null) {
				canvas.width = Math.ceil(rect.width)
				canvas.height = Math.ceil(rect.height)
			} else {
				canvas.width = this.gameData.canvasWidth
				canvas.height = this.gameData.canvasHeight
			}
		}
	}

	handleRetryClick = () => {
		let canvas = this.canvasRef.current

		this.gameRunning = true
		this.gameData = getDefaultGameData(canvas.width, canvas.height)
		this.forceUpdate()
	}

	render() {
		return (
			<div className="game-container" ref={this.containerRef}>
				<canvas ref={this.canvasRef} onContextMenu={e => e.preventDefault()}></canvas>
				<GameUI
					continueGame={this.handleContinueGame}
					retryClick={this.handleRetryClick}
					gameData={this.gameData}
					isViewingGame={this.props.viewGame != null}
				/>
			</div>
		)
	}
}