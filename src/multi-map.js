export default class MultiMap {
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
        let arr = this.data[key]
        if(!arr)
            return
        let index = arr.lastIndexOf(value)
        if(index === -1)
            return
        if(arr.length === 1)
            delete this.data[key]
        else
            arr.splice(index, 1)
    }
    removeFirst(key, value) {
        let arr = this.data[key]
        if(!arr)
            return
        let index = arr.firstIndexOf(value)
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
        let arr = this.data[key]
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
            let arr = this.data[key]
            if(arr.length > 0)
                callback(key, arr)
        })
    }

    *[Symbol.iterator]() {
        for(let key in this.data) {
            let arr = this.data[key]
            if(arr.length > 0)
                for(let element of arr)
                    yield element
        }
    }
}
