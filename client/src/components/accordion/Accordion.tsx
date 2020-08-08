import React, {Component, createRef, RefObject} from "react"
import './Accordion.scss'

type P = {
    isActive: boolean
}
type S = {
    height: string
}

class Accordion extends Component<P, S> {
    private content: RefObject<HTMLDivElement>

    constructor(props: P) {
        super(props)
        this.state = {
            height: '0px',
        }
        this.content = createRef()
    }

    render() {
        return (
            <div className="accordion" ref={this.content}
                 style={{maxHeight: this.props.isActive ? `${this.content.current!.scrollHeight}px` : '0px'}}>
                {this.props.children}
            </div>
        )
    }
}

export default Accordion