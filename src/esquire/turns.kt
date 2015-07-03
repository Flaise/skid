package esquire

object turns {
    fun wrap(a: Double): Double {
        val result = a - Math.ceil(a)
        return when(result) {
            0.0 -> result
            else -> result + 1
        }
    }

    fun toRadians(a: Double) = a * 2 * Math.PI
    fun fromRadians(a: Double) = a / 2 / Math.PI

    fun shortestOffset(from: Double, to: Double) = wrap(wrap(to) - wrap(from) + 1.5) - .5

    private val north = Vect2(0.0, -1.0)
    val NORTH = 0.0
    val EAST = .25
    val SOUTH = .5
    val WEST = .75
    fun toVector(a: Double): Vect2 {
        return when(wrap(a)) {
            NORTH -> Vect2(0.0, -1.0)
            EAST -> Vect2(1.0, 0.0)
            SOUTH -> Vect2(0.0, 1.0)
            WEST -> Vect2(-1.0, 0.0)
            else -> north.rotated(a)
        }
    }
}
