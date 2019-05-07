import { createElement, updateElement } from '../utils/renderer'
import state from '../utils/state'

class DocInputBox{
    constructor(){
        this.cursorPosX = 0
        this.cursorPoxY = 0
        this.imeStatus = false
        this.dummy = null

        state.mutations.setInputBoxObj(this)
    }

    render(){
        this.el = createElement('div', {
            class: 'inputbox',
            attrs: {
                contentEditable: true,
            },
            style: {
                position: 'absolute',
                left: this.cursorPosX + 'px',
                top: this.cursorPoxY + 'px',
                opacity: 0,
                pointerEvents: 'none',
                outline: 'none',
            }
        })

        window.goog.events.listen(this.el, window.goog.events.EventType.INPUT, this.inputHandler.bind(this));
        window.goog.events.listen(new window.goog.events.ImeHandler(this.el),
            window.goog.object.getValues(window.goog.events.ImeHandler.EventType), this.imeHandler.bind(this));

        return this.el
    }

    updatePos(cursorPosX, cursorPosY){
        this.cursorPosX = cursorPosX
        this.cursorPoxY = cursorPosY
        updateElement(this.el, {
            style: {
                left: this.cursorPosX + 'px',
                top: this.cursorPoxY + 'px',
            }
        })

        this.el.focus()
        this.el.textContent = ''
    }

    inputHandler(e){
        if(!this.imeStatus){
            state.mutations.addOrUpdateParaRun({
                text: this.el.textContent,
                textStyle: {},
            })
            this.el.textContent = ''
        }else{
            var ib = state.document.cursor.inlineBlock
            var si = state.document.cursor.inlineStartIndex
            
            var text = ib.text
            var leftText = text.substr(0, si)
            var rightText = text.substr(si)
            var midText = this.el.textContent

            var leftDummy = createElement('span', {}, [
                window.goog.dom.createTextNode(leftText)
            ])
            var midDummy = createElement('span', {
                style: {
                    textDecoration: 'underline',
                }
            }, [
                window.goog.dom.createTextNode(midText)
            ])
            var rightDummy = createElement('span',  {}, [
                window.goog.dom.createTextNode(rightText)
            ])
            var dummy = createElement('div', {
                style: {
                    class: 'input-dummy',
                    display: 'inline-block',
                    height: ib.inlineHeight + 'px',
                }
            }, [
                leftDummy, midDummy, rightDummy
            ])

            if(this.dummy){
                this.dummy.remove()
            }
            this.dummy = dummy

            ib.obj.el.style.display = 'none'
            goog.dom.insertSiblingAfter(this.dummy, ib.obj.el)
        }
    }

    imeHandler(e){
        if(e.type == 'startIme' ) {
            this.imeStatus = true
            state.mutations.setImeStatus(this.imeStatus)

        } else if(e.type == 'endIme' ) {
            state.mutations.addOrUpdateParaRun({
                text: this.el.textContent,
                textStyle: {},
            })
            this.el.textContent = ''

            this.imeStatus = false
            state.mutations.setImeStatus(this.imeStatus)

            var ib = state.document.cursor.inlineBlock
            ib.obj.el.style.display = 'inline-block'
            if(this.dummy){
                this.dummy.remove()
            }

        } else if(e.type == 'updateIme') {
            
        }
    }
}

export default DocInputBox