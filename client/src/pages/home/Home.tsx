import React from "react"
import Spinner from "../../components/spinner/Spinner"
import './Home.scss'

type stateTypes = {
    isLoaded: boolean
    article: any[]
}

class Home extends React.Component<any, stateTypes> {
    constructor(props: any) {
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
                <div>Заглавная страница</div>
            </div>
        )
    }
}

export default Home