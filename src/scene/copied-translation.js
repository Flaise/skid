import Translation from './translation'

export default class CopiedTranslation extends Translation {
    constructor(root, target, autoDelete) {
        super(root, target? target.x.curr: 0, target? target.y.curr: 0)
        this.target = target
        this.autoDelete = autoDelete
    }
    
    draw(context) {
        if(this.target) {
            if(this.target.removed) {
                if(this.autoDelete) {
                    this.remove()
                    return
                }
                else {
                    this.target = undefined
                }
            }
            else {
                this.x.setToInitial(this.target.x.curr)
                this.y.setToInitial(this.target.y.curr)
            }
        }
        super.draw(context)
    }
}
