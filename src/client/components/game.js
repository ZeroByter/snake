import React, { createRef } from "react"
import { lerp } from "../../shared/essentials"
import vector2 from "../classes/vector2"
import GameUI from "./game-ui"
import "./game.scss"

const getDefaultGameData = (width, height) => {
	let gameData = {
		paused: false,
		gameStartTime: new Date().getTime(),
		head: {
			location: new vector2(),
			parent: null
		},
		parts: [],
		foods: [],
		score: 0,
		debug: false,
		lineSnake: true,
		isDead: false,
		metersMoved: 0,
	}

	return gameData
}

export default class Game extends React.Component {
	gameRunning = true
	mouseLocation = new vector2()

	gameData = getDefaultGameData()

	containerRef = createRef()
	canvasRef = createRef()

	componentDidMount() {
		let container = this.containerRef.current
		new ResizeObserver(this.handleContainerResize).observe(container)

		let canvas = this.canvasRef.current

		canvas.width = window.innerWidth
		canvas.height = window.innerHeight

		this.gameData = getDefaultGameData(canvas.width, canvas.height)

		this.gameData.head.location = new vector2(canvas.width / 2, canvas.height / 2)

		let ctx = canvas.getContext("2d")

		const newFood = () => {
			this.gameData.foods.push({
				location: new vector2(50 + Math.random() * (canvas.width - 100), 50 + Math.random() * (canvas.height - 100)),
				expiration: 0
			})
		}
		newFood()

		const newPart = () => {
			let parent = this.gameData.head
			let location = this.gameData.head.location.copy()
			if (this.gameData.parts.length != 0) {
				parent = this.gameData.parts[this.gameData.parts.length - 1]
				location = parent.location.copy()
			}

			let placedInMiddleIndex = -1
			if (this.gameData.parts.length > 3) {
				let index = Math.floor(Math.random() * (this.gameData.parts.length - 2) + 2)
				placedInMiddleIndex = index
				parent = this.gameData.parts[index - 1]
				location = parent.location.copy()
			}

			//randomize starting location
			location = new vector2(location.x + Math.random() * 2 - 1, location.y + Math.random() * 2 - 1)

			const newPart = {
				parent,
				location
			}
			if (placedInMiddleIndex != -1) {
				this.gameData.parts.splice(placedInMiddleIndex, 0, newPart)

				this.gameData.parts[placedInMiddleIndex + 1].parent = this.gameData.parts[placedInMiddleIndex]
			} else {
				this.gameData.parts.push(newPart)
			}
		}

		newPart()
		newPart()
		newPart()

		canvas.addEventListener("mousemove", e => {
			this.mouseLocation = new vector2(e.pageX, e.pageY)
		})

		document.addEventListener("keydown", this.handleDocumentKeyDown)

		let lastHeadPosition = this.gameData.head.location.copy()
		setInterval(() => {
			if (!this.gameRunning) return

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

				let parent = this.gameData.head
				let distance = 25

				if (index != 0) {
					parent = part.parent
					distance = 20
				}

				const direction = part.location.minus(parent.location).normalized()
				this.gameData.parts[index].location = parent.location.add(direction.multiply(distance))
			})

			this.gameData.foods.forEach((food, foodIndex) => {
				if (this.gameData.head.location.distance(food.location) < 18) {
					let newPartsCount = Math.max(1, Math.round(this.gameData.parts.length / 10)) //comment this/relace this to 1 to disable exponential growth
					for (let i = 0; i < newPartsCount; i++) {
						newPart()
					}

					newFood()

					this.gameData.foods.splice(foodIndex, 1)

					this.gameData.score += 1
					this.forceUpdate()
				}
			})
		}, 5)

		let lastRender = 0

		setInterval(() => {
			if (!this.gameRunning){
				if(new Date().getTime() - lastRender < 0.5) return
			}
			lastRender = new Date().getTime()

			ctx.fillStyle = "black"
			ctx.fillRect(0, 0, canvas.width, canvas.height)

			if (this.gameData.lineSnake) {
				ctx.strokeStyle = "white"
				this.gameData.parts.forEach((part, index) => {
					ctx.lineWidth = lerp(12, 4, index / this.gameData.parts.length)
					ctx.beginPath()
					ctx.moveTo(part.location.x, part.location.y)
					ctx.lineTo(part.parent.location.x, part.parent.location.y)
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
			if (this.gameData.debug) {
				ctx.font = '10px serif';
				ctx.strokeStyle = "red"
				ctx.fillStyle = "blue"
				ctx.lineWidth = 2
				this.gameData.parts.forEach((part, index) => {
					ctx.beginPath()
					ctx.moveTo(part.location.x, part.location.y)
					ctx.lineTo(part.parent.location.x, part.parent.location.y)
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
	}

	componentWillUnmount() {
		document.removeEventListener("keydown", this.componentWillUnmount)
	}

	handleDocumentKeyDown = e => {
		if (e.code === "Space" || e.code === "KeyP" || e.code === "Escape") {
			this.gameRunning = false
			this.gameData.paused = true
			this.forceUpdate()
		}

		if (e.code === "KeyD") {
			this.gameData.debug = !this.gameData.debug
		}

		if (e.code === "KeyL") {
			this.gameData.lineSnake = !this.gameData.lineSnake
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

		canvas.width = Math.ceil(rect.width)
		canvas.height = Math.ceil(rect.height)
	}

	render() {
		return (
			<div className="game-container" ref={this.containerRef}>
				<canvas ref={this.canvasRef} onContextMenu={e => e.preventDefault()}></canvas>
				<GameUI
					continueGame={this.handleContinueGame}
					gameData={this.gameData}
				/>
			</div>
		)
	}
}