package esquire

data class Vect2(val x: Double, val y: Double) {
    fun plus(other: Vect2) = Vect2(x + other.x, y + other.y)
    fun plusn(x: Double, y: Double) = Vect2(this.x + x, this.y + y)

    fun minus(other: Vect2) = Vect2(x - other.x, y - other.y)
    fun minus() = Vect2(-x, -y)

    fun times(other: Vect2) = Vect2(x * other.x, y * other.y)
    fun times(other: Double) = Vect2(x * other, y * other)

    fun div(other: Vect2) = Vect2(x / other.x, y / other.y)
    fun div(other: Double) = Vect2(x * other, y * other)

    fun dist4(other: Vect2) = Math.abs(x - other.x) + Math.abs(y - other.y)

    fun dist8(other: Vect2) = Math.max(Math.abs(x - other.x), Math.abs(y - other.y))

    fun rotated(angle: Double): Vect2 {
        val rad = turns.toRadians(angle)
        val sin = Math.sin(rad)
        val cos = Math.cos(rad)
        return Vect2(this.x * cos - this.y * sin, this.x * sin + this.y * cos)
    }
}

val ZERO = Vect2(0.0, 0.0)
