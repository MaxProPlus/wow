import React, {ChangeEvent, Component} from 'react'
import './CommentForm.scss'
import userContext from '../../contexts/userContext'
import AvatarImg from '../../components/avatar-img/AvatarImg'
import Button from '../../components/button/Button'
import Input from '../../components/input/Input'
import Spinner from '../../components/spinner/Spinner'
import AlertDanger from '../../components/alertDanger/AlertDanger'
import Validator from '../../../../server/src/common/validator'
import {Comment} from '../../../../server/src/common/entity/types'

type P = {
  onCommentUpdate: () => void
  onSendComment: (comment: Comment | any) => Promise<any>
}

type S = {
  isLoaded: boolean
  comment: string
  errorMessage: string
}

class CommentForm extends Component<P, S> {
  static contextType = userContext
  private validator = new Validator()

  constructor(props: P) {
    super(props)
    this.state = {
      isLoaded: true,
      comment: '',
      errorMessage: '',
    }
  }

  handleSubmit = (
    e:
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault()
    let comment = new Comment()
    comment.text = this.state.comment
    const err = this.validator.validateComment(comment)
    if (err) {
      this.setState({
        errorMessage: err,
      })
      return
    }
    this.setState({
      isLoaded: false,
      errorMessage: '',
    })
    this.props
      .onSendComment(comment)
      .then(
        () => {
          this.props.onCommentUpdate()
        },
        (err: string) => {
          this.setState({
            errorMessage: err,
          })
        }
      )
      .finally(() => {
        this.setState({
          isLoaded: true,
          comment: '',
        })
      })
  }

  handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      errorMessage: '',
      comment: e.target.value,
    })
  }

  render() {
    return (
      <>
        <AlertDanger>{this.state.errorMessage}</AlertDanger>
        <form className="comment-form" onSubmit={this.handleSubmit}>
          {!this.state.isLoaded && <Spinner />}
          <AvatarImg url={this.context.user.urlAvatar} />
          <Input value={this.state.comment} onChange={this.handleChange} />
          <Button onClick={this.handleSubmit}>Отправить</Button>
        </form>
      </>
    )
  }
}

export default CommentForm
