import React from 'react'
import {Link} from 'react-router-dom'

type P = {
    className?: string
    style?: React.CSSProperties
    id: number
    href: string
    urlAvatar: string
    title: string
    muteTitle: string
    updateHeight?: Function
    children?: React.ReactNode
}

class Slide extends React.Component<P> {
    static defaultProps = {className: ''}
    private img: HTMLImageElement | null = null

    componentDidMount() {
        if (this.props.updateHeight) {
            console.log('resize')
            window.addEventListener('resize', this.handleResize)
        }
    }

    componentWillUnmount() {
        if (this.props.updateHeight) {
            window.removeEventListener('resize', this.handleResize)
        }
    }

    handleResize = () => {
        if (this.img) {
            this.props.updateHeight!(this.img.scrollHeight)
        }
    }


    loaded = (e: any) => {
        if (this.props.updateHeight) {
            this.props.updateHeight(e.target.scrollHeight)
        }
    }

    render() {
        let {className, id, href, urlAvatar, title, muteTitle, children, style} = this.props
        return (
            <div className={`slider__item ${className}`} style={style}>
                <Link to={href + id} className="slider-item">
                    <img ref={(img) => {
                        this.img = img
                    }} onLoad={this.loaded} src={urlAvatar} alt=""
                         className="slider-item__img"/>
                    <div className="slider-item__bg"/>
                    <div className="slider-item__anons">{muteTitle}</div>
                    <div className="slider-item__title">{title}</div>
                    {children}
                </Link>
            </div>
        )
    }
}

export default Slide