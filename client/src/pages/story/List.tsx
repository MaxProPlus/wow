import React, {ChangeEvent, Component} from "react"
import {Story} from "../../../../server/src/common/entity/types"
import Button from "../../components/button/Button"
import {Row} from "react-bootstrap"
import styles from "../../css/listTitle.module.scss"
import icon from "./img/icon.svg"
import StoryApi from "../../api/StoryApi"
import Spinner from "../../components/spinner/Spinner"
import PageTitle from "../../components/pageTitle/PageTitle"
import Search from "../../components/list/Search"
import AlertDanger from "../../components/alert-danger/AlertDanger"
import Block from "../../components/list/Block"

type S = {
    isLoaded: boolean,
    errorMessage: string,
    count: number,
    list: Story[],
    query: string,
}

class StoryList extends Component<any, S> {
    private storyApi = new StoryApi()
    private page = 1
    private limit = 10
    private query = ''

    constructor(props: any) {
        super(props)
        this.state = {
            isLoaded: false,
            errorMessage: '',
            count: 0,
            list: [],
            query: '',
        }
    }

    componentDidMount() {
        this.updateData(true)
    }


    updateData = (reset: boolean) => {
        this.storyApi.getAll(this.query, this.limit, this.page).then(r => {
            if (reset) {
                this.setState({
                    list: r.data,
                })
            } else {
                this.setState((prevState: S) => {
                    return {
                        list: prevState.list.concat(r.data),
                        count: r.count,
                    }
                })
            }
        }, (err) => {
            this.setState({
                errorMessage: err,
            })
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
        this.updateData(false)
    }

    onChange = (e: ChangeEvent<HTMLInputElement>) => {
        this.setState({
            query: e.target.value
        })
    }

    handleSubmit = (e: any) => {
        e.preventDefault()
        this.query = this.state.query
        this.page = 1
        this.setState({
            isLoaded: false
        })
        this.updateData(true)
    }

    render() {
        if (!!this.state.errorMessage) {
            return (<AlertDanger>{this.state.errorMessage}</AlertDanger>)
        }
        const more = this.limit * this.page < this.state.count ?
            <Button onClick={this.handlePageClick} className="more-btn">Загрузить еще</Button> : undefined
        return (
            <div>
                {!this.state.isLoaded && <Spinner/>}
                <PageTitle className={styles.header} title="Сюжеты" icon={icon}>
                    <Search href="/material/story/create" text="Создать сюжет" placeholder="Поиск сюжета"
                            value={this.state.query} onChange={this.onChange} onSubmit={this.handleSubmit}/>
                </PageTitle>
                {this.state.list.length > 0 ?
                    <Row>
                        {this.state.list.map(el =>
                            (<Block key={el.id} id={el.id} title={el.title} muteTitle={el.shortDescription}
                                    urlAvatar={el.urlAvatar} href="/material/story/" size={4}/>)
                        )}
                    </Row>
                    :
                    'Сюжеты не найдены'}
                {more}
            </div>
        )
    }
}

export default StoryList