import React, {ChangeEvent, Component} from "react"
import CharacterApi from "../../api/CharacterApi"
import {Character} from "../../../../server/src/common/entity/types"
import {Row} from "react-bootstrap"
import Button from "../../components/button/Button"
import Spinner from "../../components/spinner/Spinner"
import icon from "./img/char.svg"
import PageTitle from "../../components/pageTitle/PageTitle"
import Search from "../../components/list/Search"
import AlertDanger from "../../components/alert-danger/AlertDanger"
import styles from "../../css/listTitle.module.scss"
import Block from "../../components/list/Block"

type S = {
    isLoaded: boolean,
    errorMessage: string,
    count: number,
    list: Character[],
    query: string
}


class CharacterList extends Component<any, S> {
    private characterApi = new CharacterApi()
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
        this.updateData(false)
    }

    updateData = (reset: boolean) => {
        this.characterApi.getAll(this.query, this.limit, this.page).then(r => {
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
        if (!!this.state.errorMessage) {
            return (<AlertDanger>{this.state.errorMessage}</AlertDanger>)
        }
        const more = this.limit * this.page < this.state.count ?
            <Button onClick={this.handlePageClick} className="more-btn">Загрузить еще</Button> : ''
        return (
            <div className="character-list">
                {!this.state.isLoaded && <Spinner/>}
                <PageTitle title="Персонажи" icon={icon} className={styles.header}>
                    <Search href="/material/character/create" text="Создать персонажа" placeholder="Поиск персонажа"
                            value={this.state.query} onChange={this.onChange} onSubmit={this.handleSubmit}/>
                </PageTitle>
                {this.state.list.length > 0 ?
                    <Row>
                        {this.state.list.map(el =>
                            (<Block key={el.id} id={el.id} title={el.title} muteTitle={el.nickname}
                                    urlAvatar={el.urlAvatar} href="/material/character/" size={3}/>)
                        )}
                    </Row>
                    :
                    'Персонажи не найдены'}
                {more}
            </div>
        )
    }
}

export default CharacterList