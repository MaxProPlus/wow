import React from "react"
import Spinner from "../../components/spinner/Spinner"
import {Account, CommentReport, Report} from "../../../../server/src/common/entity/types"
import UserContext from "../../utils/userContext"
import AlertDanger from "../../components/alert-danger/AlertDanger"
import CommentForm from "../../components/commentFrom/CommentForm"
import Comment from "../../components/comment/Comment"
import {Col, Row} from "react-bootstrap"
import icon from "./img/report.svg"
import InfoBlock from "../../components/show/InfoBlock"
import Title from "../../components/show/Title"
import Motto from "../../components/show/Motto"
import ConfirmationWindow from "../../components/confirmationWindow/ConfirmationWindow"
import history from "../../utils/history"
import PageTitle from "../../components/pageTitle/PageTitle"
import ControlButton from "../../components/show/ControlButton"
import Avatar from "../../components/show/Avatar"
import Card from "../../components/show/Card"
import ReportApi from "../../api/ReportApi"
import {RouteComponentProps} from "react-router-dom"
import {MatchId} from "../../types/RouteProps"

type P = RouteComponentProps<MatchId>

type S = {
    isLoaded: boolean
    isAdmin: boolean
    modalShow: boolean
    errorMessage: string
    id: string
    report: Report
    comments: CommentReport[]
}

class ReportPage extends React.Component<P, S> {
    static contextType = UserContext
    private reportApi = new ReportApi()

    constructor(props: P) {
        super(props)
        this.state = {
            isLoaded: false,
            isAdmin: false,
            modalShow: false,
            errorMessage: '',
            id: props.match.params.id,
            report: new Report(),
            comments: [],
        }
    }

    static getDerivedStateFromProps(nextProps: P, prevState: S) {
        // Проверка изменения url
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

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>) {
        // Проверить есть ли права на редактирование
        if (!this.state.isAdmin && this.context.user.id > 0) {
            const isAdmin = ((this.state.report.coauthors.findIndex((el: Account) => {
                return el.id === this.context.user.id
            }) === -1) ? this.context.user.id === this.state.report.idAccount : true)
            if (isAdmin) {
                this.setState({
                    isAdmin
                })
            }
        }
        // Проверка изменения url
        if (prevProps.match.params.id !== this.state.id) {
            this.setState({
                isLoaded: false,
            })
            this.updateData()
        }
    }

    updateData = () => {
        this.reportApi.getById(this.state.id).then(r => {
            this.setState({
                report: r[0],
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
        this.reportApi.getComments(this.state.id).then(r => {
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

    handleSendComment = (comment: CommentReport) => {
        comment.idReport = this.state.report.id
        return this.reportApi.addComment(comment)
    }

    handleRemove = () => {
        this.setState({
            modalShow: false,
            isLoaded: false
        })
        this.reportApi.remove(this.state.id).then(() => {
            history.push('/material/report')
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
                                    show={this.state.modalShow} title="Вы действительно хотите удалить отчет / лог?"/>
                <div>
                    <PageTitle title="Отчет / лог" icon={icon}>
                        <ControlButton show={this.state.isAdmin} id={this.state.id}
                                       type='report' nameRemove='отчет / лог'
                                       showRemoveWindow={this.showRemoveWindow}/>
                    </PageTitle>
                    <Row>
                        <Col md={4}>
                            <Avatar src={this.state.report.urlAvatar}/>
                        </Col>
                        <Col md={8}>
                            <Title>{this.state.report.title}</Title>
                            {/*<SubTitle>{this.state.report.nickname}</SubTitle>*/}{/*для имени автора*/}
                            <Motto>{this.state.report.shortDescription}</Motto>
                        </Col>
                    </Row>
                    <InfoBlock title="Описание отчета / лога" value={this.state.report.description}/>
                    <InfoBlock title="Важная информация" value={this.state.report.rule}/>
                    <Card title="Участники" href="/material/character/" list={this.state.report.members}/>
                    {/*<List title="Гильдии" href="/material/guild/" list={this.state.report.guilds}/>*/}
                    {/*<List title="Сюжеты" href="/material/story/" list={this.state.report.stores}/>*/}

                    <div className="comments">
                        {this.state.comments.map((c) =>
                            <Comment key={c.id} {...c}/>
                        )}
                    </div>
                    {(!this.state.report.comment && this.context.user.id !== -1) &&
                    <CommentForm onCommentUpdate={this.updateComment} onSendComment={this.handleSendComment}/>}
                </div>
            </div>
        )
    }
}

export default ReportPage