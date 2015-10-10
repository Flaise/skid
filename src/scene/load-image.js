
export default function loadImage(source, next) {
    const image = new window.Image()
    image.onload = () => {
        image.onload = image.onerror = image.onabort = undefined
        next && next(undefined, image)
    }
    image.onerror = () => {
        image.onload = image.onerror = image.onabort = undefined
        next && next(new Error('Unable to load image.'))
    }
    image.src = source
    return image
}
