const lerp = (a, b, t) => {
    return a + (b - a) * t
}

window.onload = function () {
    let canvas = document.getElementById("canvas")

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let ctx = canvas.getContext("2d")

    let gameRunning = true
    let pauseActive = false
    let pauseContinueStartTime = -1

    let head = {
        location: new vector2(canvas.width / 2, canvas.height / 2),
        parent: null
    }
    let parts = []
    let foods = []
    let mouseLocation = new vector2()
    let score = 0

    const UpdateUI = () => {
        //this function is pretty ineffecient but whatever...
        document.getElementById("score").innerHTML = "Score: " + score

        if(pauseActive){
            document.getElementById("pause-screen").style.display = ""
        }else{
            document.getElementById("pause-screen").style.display = "none"
        }
    }
    UpdateUI()

    const newFood = () => {
        foods.push({
            location: new vector2(50 + Math.random() * (canvas.width - 100), 50 + Math.random() * (canvas.height - 100)),
            expiration: 0
        })
    }
    newFood()

    const newPart = () => {
        let parent = head
        let location = head.location.copy()
        if (parts.length != 0) {
            parent = parts[parts.length - 1]
            location = parent.location.copy()
        }

        let placedInMiddleIndex = -1
        if (parts.length > 3) {
            let index = Math.floor(Math.random() * (parts.length - 2) + 2)
            placedInMiddleIndex = index
            parent = parts[index - 1]
            location = parent.location.copy()
        }

        //randomize starting location
        location = new vector2(location.x + Math.random() * 2 - 1, location.y + Math.random() * 2 - 1)

        const newPart = {
            parent,
            location
        }
        if (placedInMiddleIndex != -1) {
            parts.splice(placedInMiddleIndex, 0, newPart)

            parts[placedInMiddleIndex + 1].parent = parts[placedInMiddleIndex]
        } else {
            parts.push(newPart)
        }
    }

    newPart()
    newPart()
    newPart()

    canvas.addEventListener("mousemove", e => {
        mouseLocation = new vector2(e.pageX, e.pageY)
    })

    document.addEventListener("keydown", e => {
        if(e.code === "Space" || e.code === "KeyP" || e.code === "Escape"){
            gameRunning = false
            pauseActive = true
            UpdateUI()
        }
    })

    setInterval(() => {
        if (!gameRunning) return

        head.location.x = mouseLocation.x
        head.location.y = mouseLocation.y

        parts.forEach((part, index) => {
            let distanceToHead = part.location.distance(head.location)
            if (index > 0 && distanceToHead > 5 && distanceToHead < 17) {
                gameRunning = false
                alert("fuck you lost")
            }

            let parent = head
            let distance = 25

            if (index != 0) {
                parent = part.parent
                distance = 20
            }

            const direction = part.location.minus(parent.location).normalized()
            parts[index].location = parent.location.add(direction.multiply(distance))
        })

        foods.forEach((food, foodIndex) => {
            if (head.location.distance(food.location) < 18) {
                let newPartsCount = Math.max(1, Math.round(parts.length / 10))
                for (let i = 0; i < newPartsCount; i++) {
                    newPart()
                }

                newFood()

                foods.splice(foodIndex, 1)

                score += 1
                UpdateUI()
            }
        })
    }, 5)

    //debug
    // ctx.font = '10px serif';
    // ctx.strokeStyle = "red"
    setInterval(() => {
        if (!gameRunning) return

        ctx.fillStyle = "black"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.fillStyle = "red"
        ctx.beginPath()
        ctx.arc(head.location.x, head.location.y, 10, 0, 2 * Math.PI)
        ctx.fill()

        ctx.fillStyle = "white"
        parts.forEach((part, index) => {
            ctx.beginPath()
            ctx.arc(part.location.x, part.location.y, lerp(10, 7.5, index / parts.length), 0, 2 * Math.PI)
            ctx.fill()
        })

        //debug...
        // ctx.fillStyle = "blue"
        // parts.forEach((part, index) => {
        //     ctx.beginPath()
        //     ctx.moveTo(part.location.x, part.location.y)
        //     ctx.lineTo(part.parent.location.x, part.parent.location.y)
        //     ctx.stroke()

        //     ctx.fillText(index, part.location.x, part.location.y);
        // })

        foods.forEach(food => {
            ctx.fillStyle = `rgba(0,255,0,${1 - food.expiration})`
            ctx.beginPath()
            ctx.arc(food.location.x, food.location.y, 8, 0, 2 * Math.PI)
            ctx.fill()
        })
    }, 10)
}