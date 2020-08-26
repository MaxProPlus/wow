import React, {Component} from "react"
import {Link} from "react-router-dom"
import {Story} from "../../../../server/src/common/entity/types"
import Button from "../../components/button/Button"
import {Col, Row} from "react-bootstrap"
import styles from './List.module.scss'
import icon from "./img/icon.svg"
import StoryApi from "../../api/StoryApi"
import Spinner from "../../components/spinner/Spinner"
import PageTitle from "../../components/pageTitle/PageTitle"

type S = {
    isLoaded: boolean,
    count: number,
    list: Story[],

}

class StoryList extends Component<any, S> {
    private storyApi = new StoryApi()
    private page = 1
    private limit = 10

    constructor(props: any) {
        super(props)
        this.state = {
            isLoaded: false,
            count: 0,
            list: [],
        }
    }

    componentDidMount() {
        this.updateData()
    }


    updateData = () => {
        this.storyApi.getAll(this.limit, this.page).then(r => {
            this.setState((prevState: S) => {
                return {
                    list: prevState.list.concat(r.data),
                    count: r.count,
                }
            })
        }, (err) => {
            console.error(err)
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })
    }

    handlePageClick = () => {
        this.setState({
            isLoaded: false,
        })
        this.page += 1
        this.updateData()
    }

    render() {
        const more = this.limit * this.page < this.state.count ?
            <Button onClick={this.handlePageClick} className="more-btn">Загрузить еще</Button> : undefined
        return (
            <div>
                {!this.state.isLoaded && <Spinner/>}
                <PageTitle title="Сюжеты" icon={icon}>
                    <Button to="/material/story/create">Создать сюжет</Button>
                </PageTitle>
                {this.state.list.length > 0 ?
                    <Row>
                        {this.state.list.map(el =>
                            (<Block key={el.id} {...el}/>)
                        )}
                    </Row>
                    :
                    'Сюжеты не найдены'}
                {more}
            </div>
        )
    }
}

const Block = (props: Story) => {
    return (
        <Col className={styles.block} lg={4}>
            <Link to={"/material/story/" + props.id}>
                <img src={props.urlAvatar} alt=""/>
                <div className={styles.block__background}/>
                <div className={styles.block__title}>{props.title}</div>
                {/*<div className={styles.blockGuild__gameTitle}>{props.gameTitle}</div>*/}
            </Link>
        </Col>
    )
}

export default StoryList