import React from "react"
import Spinner from "../../components/spinner/Spinner"
import {CommentStory, Story, storyStatusToString} from "../../../../server/src/common/entity/types"
import UserContext from "../../utils/userContext"
import AlertDanger from "../../components/alert-danger/AlertDanger"
import Button from "../../components/button/Button"
import CommentForm from "../../components/commentFrom/CommentForm"
import Comment from "../../components/comment/Comment"
import {Col, Row} from "react-bootstrap"
import InfoBlockInline from "../../components/show/InfoBlockInline"
import InfoBlock from "../../components/show/InfoBlock"
import Title from "../../components/show/Title"
import Motto from "../../components/show/Motto"
import icon from './img/icon.svg'
import StoryApi from "../../api/storyApi"
import dateIcon from './img/date.svg'
import statusIcon from '../../img/status.svg'
import styles from './Show.module.scss'

type S = {
    isLoaded: boolean
    errorMessage: string
    id: string
    story: Story
    comments: CommentStory[]
}

class StoryPage extends React.Component<any, S> {
    static contextType = UserContext
    private storyApi = new StoryApi()

    constructor(props: any) {
        super(props)
        this.state = {
            isLoaded: false,
            errorMessage: '',
            id: props.match.params.id,
            story: new Story(),
            comments: [],
        }
    }

    componentDidMount() {
        this.updateData()
    }

    updateData = () => {
        this.storyApi.getById(this.state.id).then(r => {
            this.setState({
                story: r[0],
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
        this.storyApi.getComments(this.state.id).then(r => {
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

    handleSendComment = (comment: CommentStory) => {
        comment.idStory = this.state.story.id
        return this.storyApi.addComment(comment)
    }

    render() {
        if (!!this.state.errorMessage) {
            return (<AlertDanger>{this.state.errorMessage}</AlertDanger>)
        }

        return (
            <div>
                {!this.state.isLoaded && <Spinner/>}
                <div className="page-guild">
                    <div className="page-title">
                        <h1>
                            <img src={icon} alt=""/>
                            Сюжеты
                        </h1>
                        <div className="d-flex justify-content-end">
                            {this.context.user.id === this.state.story.idAccount &&
                            <Button to={`/material/story/edit/${this.state.id}`}>Редактировать</Button>}
                            {this.context.user.id === this.state.story.idAccount &&
                            <Button>Удалить сюжет</Button>}
                        </div>
                    </div>
                    <Row>
                        <Col md={4}>
                            <img className={styles.avatar} src={this.state.story.urlAvatar} alt=""/>
                        </Col>
                        <Col md={8}>
                            <Title>{this.state.story.title}</Title>
                            <Motto>{this.state.story.shortDescription}</Motto>
                            <InfoBlockInline icon={dateIcon} title="Дата начала"
                                             value={(new Date(this.state.story.dateStart)).toDateString()}/>
                            <InfoBlockInline icon={statusIcon} title="Статус"
                                             value={storyStatusToString(this.state.story.status)}/>
                        </Col>
                    </Row>
                    <InfoBlock title="Сюжет" value={this.state.story.description}/>
                    <InfoBlock title="Важное" value={this.state.story.important}/>
                    <InfoBlock title="Дополнительные сведения" value={this.state.story.more}/>
                    <div className="comments">
                        {this.state.comments.map((c) =>
                            <Comment key={c.id} {...c}/>
                        )}
                    </div>
                    {(!this.state.story.comment && this.context.user.id !== -1) &&
                    <CommentForm onCommentUpdate={this.updateComment} onSendComment={this.handleSendComment}/>}

                </div>
            </div>
        )
    }
}

export default StoryPage