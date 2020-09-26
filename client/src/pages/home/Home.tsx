import React from "react"
import Spinner from "../../components/spinner/Spinner"
import './Home.scss'
import {RouteComponentProps} from "react-router-dom"

type P = RouteComponentProps

type S = {
    isLoaded: boolean
    article: any[]
}

class Home extends React.Component<P, S> {
    constructor(props: P) {
        super(props)
        this.state = {
            isLoaded: false,
            article: [],
        }
    }

    componentDidMount() {
        this.setState({
            isLoaded: true,
            article: [],
        })
    }

    render() {
        return (
            <div className="home-page">
                {!this.state.isLoaded && <Spinner/>}
                Добро пожаловать на Equilibrium - русскоязычной ролевой проект World of Warcraft
            </div>
        )
    }
}

export default Home