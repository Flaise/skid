
export default function loadImage(source, next) {
    const image = new window.Image()
    image.onload = () => {
        image.onload = image.onerror = undefined
        if (next) next(undefined, image)
    }
    image.onerror = () => {
        image.onload = image.onerror = undefined
        if (next) next(new Error(`Unable to load image ${source}`))
    }
    image.src = source
    return image
}
