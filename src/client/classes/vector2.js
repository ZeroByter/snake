//vector module
function vector2(x, y) {
    this.x = x || 0
    this.y = y || 0
}
vector2.prototype.add = function (otherVector) {
    return new vector2(this.x + otherVector.x, this.y + otherVector.y)
}
vector2.prototype.minus = function (otherVector) {
    return new vector2(this.x - otherVector.x, this.y - otherVector.y)
}
vector2.prototype.multiply = function (factor) {
    return new vector2(this.x * factor, this.y * factor)
}
vector2.prototype.magnitude = function () {
    return Math.sqrt((this.x * this.x) + (this.y * this.y))
}
vector2.prototype.normalized = function () {
    const length = this.magnitude()
    return new vector2(this.x / length, this.y / length)
}
vector2.prototype.distance = function (otherVector) {
    return Math.sqrt(Math.pow(this.x - otherVector.x, 2) + Math.pow(this.y - otherVector.y, 2))
}
vector2.prototype.copy = function () {
    return new vector2(this.x, this.y)
}

export default vector2