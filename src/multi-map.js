export class MultiMap {
    constructor() {
        this.data = Object.create(null)
    }

    get(key) {
        let result = this.data[key]
        if(!result) {
            result = []
            this.data[key] = result
        }
        return result
    }
    add(key, value) {
        this.get(key).push(value)
    }
    removeLast(key, value) {
        const arr = this.data[key]
        if(!arr)
            return
        const index = arr.lastIndexOf(value)
        if(index === -1)
            return
        if(arr.length === 1)
            delete this.data[key]
        else
            arr.splice(index, 1)
    }
    removeFirst(key, value) {
        const arr = this.data[key]
        if(!arr)
            return
        const index = arr.firstIndexOf(value)
        if(index === -1)
            return
        if(arr.length === 1)
            delete this.data[key]
        else
            arr.splice(index, 1)
    }
    remove(key, value) {
        this.removeLast(key, value)
    }
    count(key) {
        const arr = this.data[key]
        return arr? arr.length: 0
    }

    /*
     * Does not support concurrent modification
     */
    forEachValue(callback) {
        this.forEachMapping((key, arr) => arr.forEach(callback))
    }

    forEachMapping(callback) {
        Object.keys(this.data).forEach(key => {
            const arr = this.data[key]
            if(arr.length > 0)
                callback(key, arr)
        })
    }

    *[Symbol.iterator]() {
        for(const key in this.data) {
            const arr = this.data[key]
            if(arr.length > 0)
                for(const element of arr)
                    yield element
        }
    }
}
