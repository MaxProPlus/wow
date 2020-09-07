import React from "react"
import Spinner from "../../components/spinner/Spinner"
import {
    Character,
    characterActiveToString,
    characterStatusToString,
    CommentCharacter,
    sexToString
} from "../../../../server/src/common/entity/types"
import UserContext from "../../utils/userContext"
import CharacterApi from "../../api/CharacterApi"
import AlertDanger from "../../components/alert-danger/AlertDanger"
import CommentForm from "../../components/commentFrom/CommentForm"
import Comment from "../../components/comment/Comment"
import {Col, Row} from "react-bootstrap"
import icon from "./img/char.svg"
import raceIcon from './img/race.svg'
import sexIcon from './img/sex.svg'
import ageIcon from './img/age.svg'
import nationIcon from './img/nation.svg'
import territoryIcon from './img/territory.svg'
import classIcon from './img/class.svg'
import occupationIcon from './img/occupation.svg'
import religionIcon from './img/religion.svg'
import languagesIcon from './img/languages.svg'
import statusIcon from './img/status.svg'
import activeIcon from '../../img/status.svg'
import InfoBlockInline from "../../components/show/InfoBlockInline"
import InfoBlock from "../../components/show/InfoBlock"
import Title from "../../components/show/Title"
import SubTitle from "../../components/show/SubTitle"
import Motto from "../../components/show/Motto"
import ConfirmationWindow from "../../components/confirmationWindow/ConfirmationWindow"
import history from "../../utils/history"
import PageTitle from "../../components/pageTitle/PageTitle"
import ControlButton from "../../components/show/ControlButton"
import Avatar from "../../components/show/Avatar"
import Card from "../../components/show/Card"
import List from "../../components/show/List"

type S = {
    isLoaded: boolean
    modalShow: boolean
    errorMessage: string
    id: string
    character: Character
    comments: CommentCharacter[]
}

class CharacterPage extends React.Component<any, S> {
    static contextType = UserContext
    private characterApi = new CharacterApi()

    constructor(props: any) {
        super(props)
        this.state = {
            isLoaded: false,
            modalShow: false,
            errorMessage: '',
            id: props.match.params.id,
            character: new Character(),
            comments: [],
        }
    }

    static getDerivedStateFromProps(nextProps: any, prevState: S) {
        if (nextProps.match.params.id !== prevState.id) {
            if (isNaN(Number(nextProps.match.params.id))) {
                history.push('/')
            }
            return {
                id: nextProps.match.params.id
            }
        }

        return null
    }

    componentDidMount() {
        this.updateData()
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<S>) {
        if (prevProps.match.params.id !== this.state.id) {
            this.setState({
                isLoaded: false,
            })
            this.updateData()
        }
    }

    updateData = () => {
        this.characterApi.getById(this.state.id).then(r => {
            this.setState({
                character: r[0],
                comments: r[1],
            })
        }, err => {
            this.setState({
                errorMessage: err
            })
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })
    }


    updateComment = () => {
        this.setState({
            isLoaded: false,
        })
        this.characterApi.getComments(this.state.id).then(r => {
            this.setState({
                comments: r,
            })
        }, err => {
            this.setState({
                errorMessage: err,
            })
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })

    }

    handleSendComment = (comment: CommentCharacter) => {
        comment.idCharacter = this.state.character.id
        return this.characterApi.addComment(comment)
    }

    handleRemove = () => {
        this.setState({
            modalShow: false,
            isLoaded: false
        })
        this.characterApi.remove(this.state.id).then(() => {
            history.push('/material/character')
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

    hideRemoveWindow = () => {
        this.setState({
            modalShow: false
        })
    }

    showRemoveWindow = () => {
        this.setState({
            modalShow: true
        })
    }


    render() {
        if (!!this.state.errorMessage) {
            return (<AlertDanger>{this.state.errorMessage}</AlertDanger>)
        }

        return (
            <div>
                {!this.state.isLoaded && <Spinner/>}
                <ConfirmationWindow onAccept={this.handleRemove} onDecline={this.hideRemoveWindow}
                                    show={this.state.modalShow} title="Вы действительно хотите удалить персонажа?"/>
                <div className="page-character">
                    <PageTitle title="Персонаж" icon={icon}>
                        <ControlButton show={this.context.user.id === this.state.character.idAccount} id={this.state.id}
                                       type='character' nameRemove='персонажа'
                                       showRemoveWindow={this.showRemoveWindow}/>
                    </PageTitle>
                    <Row>
                        <Col md={4}>
                            <Avatar src={this.state.character.urlAvatar}/>
                        </Col>
                        <Col md={8}>
                            <Title>{this.state.character.title}</Title>
                            <SubTitle>{this.state.character.nickname}</SubTitle>
                            <Motto>{this.state.character.shortDescription}</Motto>
                            <InfoBlockInline icon={raceIcon} title="Раса" value={this.state.character.race}/>
                            <InfoBlockInline icon={sexIcon} title="Пол" value={sexToString(this.state.character.sex)}/>
                            <InfoBlockInline icon={ageIcon} title="Возраст" value={this.state.character.age}/>
                            <InfoBlockInline icon={nationIcon} title="Нация" value={this.state.character.nation}/>
                            <InfoBlockInline icon={territoryIcon} title="Места" value={this.state.character.territory}/>
                            <InfoBlockInline icon={classIcon} title="Класс" value={this.state.character.className}/>
                            <InfoBlockInline icon={occupationIcon} title="Род занятий"
                                             value={this.state.character.occupation}/>
                            <InfoBlockInline icon={religionIcon} title="Верования"
                                             value={this.state.character.religion}/>
                            <InfoBlockInline icon={languagesIcon} title="Знания"
                                             value={this.state.character.languages}/>
                            <InfoBlockInline icon={statusIcon} title="Статус"
                                             value={characterStatusToString(this.state.character.status)}/>
                            <InfoBlockInline icon={activeIcon} title="Активность"
                                             value={characterActiveToString(this.state.character.active)}/>
                        </Col>
                    </Row>
                    <InfoBlock title="Внешность и характер" value={this.state.character.description}/>
                    <InfoBlock title="История персонажа" value={this.state.character.history}/>
                    <InfoBlock title="Дополнительные сведения" value={this.state.character.more}/>
                    <Card title="Друзья и знакомые" href="/material/character/" list={this.state.character.friends}/>
                    <List title="Гильдии" href="/material/guild/" list={this.state.character.guilds}/>
                    <List title="Сюжеты" href="/material/story/" list={this.state.character.stores}/>

                    <div className="comments">
                        {this.state.comments.map((c) =>
                            <Comment key={c.id} {...c}/>
                        )}
                    </div>
                    {(!this.state.character.comment && this.context.user.id !== -1) &&
                    <CommentForm onCommentUpdate={this.updateComment} onSendComment={this.handleSendComment}/>}

                </div>
            </div>
        )
    }
}

export default CharacterPage