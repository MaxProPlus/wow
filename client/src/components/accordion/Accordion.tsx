import React, {Component, createRef, RefObject} from 'react'
import styles from './Accordion.module.scss'

type P = {
    isActive: boolean
    Tag?: string
    className?: string
}

type S = {
    height: string
    scrollHeight: number
}

class Accordion extends Component<P, S> {
    private content: RefObject<HTMLDivElement>

    constructor(props: P) {
        super(props)
        this.state = {
            height: '0px',
            scrollHeight: 0,
        }
        this.content = createRef()
    }

    componentDidMount() {
        document.addEventListener('resize', this.handleResize)
        this.setState({
            scrollHeight: this.content.current!.scrollHeight,
        })
    }

    componentWillUnmount() {
        document.removeEventListener('resize', this.handleResize)
    }

    handleResize = () => {
        this.setState({
            scrollHeight: this.content.current!.scrollHeight,
        })
    }


    render() {
        let className = styles.accordion
        if (!!this.props.className) {
            className += ' ' + this.props.className
        }
        return (
            <div className={className} ref={this.content}
                 style={{maxHeight: this.props.isActive ? `${this.state.scrollHeight}px` : '0px'}}>
                {this.props.children}
            </div>
        )
    }
}

export default Accordion