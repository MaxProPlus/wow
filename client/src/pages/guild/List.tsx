import React, {ChangeEvent, Component} from "react"
import {Guild} from "../../../../server/src/common/entity/types"
import GuildApi from "../../api/GuildApi"
import Button from "../../components/button/Button"
import {Row} from "react-bootstrap"
import styles from "../../css/listTitle.module.scss"
import icon from "./img/guild.svg"
import Spinner from "../../components/spinner/Spinner"
import PageTitle from "../../components/pageTitle/PageTitle"
import Search from "../../components/list/Search"
import Block from "../../components/list/Block"

type S = {
    isLoaded: boolean,
    errorMessage: string
    count: number,
    list: Guild[],
    query: string

}

class GuildList extends Component<any, S> {
    private guildApi = new GuildApi()
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
        this.guildApi.getAll(this.query, this.limit, this.page).then(r => {
            if (reset) {
                this.setState({
                    list: r.data,
                    count: r.count,
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
                errorMessage: err
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
        const more = this.limit * this.page < this.state.count ?
            <Button onClick={this.handlePageClick} className="more-btn">Загрузить еще</Button> : undefined
        return (
            <div>
                {!this.state.isLoaded && <Spinner/>}
                <PageTitle className={styles.header} title="Гильдии" icon={icon}>
                    <Search href="/material/guild/create" text="Создать гильдию" placeholder="Поиск гильдии"
                            value={this.state.query} onChange={this.onChange} onSubmit={this.handleSubmit}/>
                </PageTitle>
                {this.state.list.length > 0 ?
                    <Row>
                        {this.state.list.map(el =>
                            (<Block key={el.id} id={el.id} title={el.title} muteTitle={el.gameTitle}
                                    urlAvatar={el.urlAvatar} href="/material/guild/" size={4}/>)
                        )}
                    </Row>
                    :
                    'Гильдии не найдены'}
                {more}
            </div>
        )
    }
}

export default GuildList