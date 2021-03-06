import React from 'react'
import './Profile.scss'
import UserContext from '../../contexts/userContext'
import UserApi from '../../api/UserApi'
import history from '../../utils/history'
import Spinner from '../../components/spinner/Spinner'
import Profile from '../../components/profile/Profile'
import {User} from '../../../../server/src/common/entity/types'
import {RouteComponentProps} from 'react-router-dom'
import {MatchId} from '../../types/RouteProps'
import Page from '../../components/page/Page'
import defaultAvatar from 'img/default.png'

type P = RouteComponentProps<MatchId>

type S = {
  isLoaded: boolean
  user: User
}

class ProfilePage extends React.Component<P, S> {
  static contextType = UserContext
  private userApi = new UserApi()

  constructor(props: P) {
    super(props)
    this.state = {
      isLoaded: false,
      user: new User(),
    }
  }

  static getDerivedStateFromProps(nextProps: Readonly<P>, prevState: S) {
    if (Number(nextProps.match.params.id) !== prevState.user.id) {
      if (isNaN(Number(nextProps.match.params.id))) {
        history.push('/')
      }
      return {
        user: {
          id: Number(nextProps.match.params.id),
        },
      }
    }
    return null
  }

  componentDidMount() {
    this.updateData()
  }

  updateData = () => {
    let id = Number(this.props.match.params.id)
    this.userApi
      .getUser(id)
      .then(
        (r) => {
          if (!r.urlAvatar) {
            r.urlAvatar = defaultAvatar
          }
          this.setState({
            user: r,
          })
        },
        () => {
          history.push('/')
        }
      )
      .finally(() => {
        this.setState({
          isLoaded: true,
        })
      })
  }

  componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>) {
    if (Number(prevProps.match.params.id) !== this.state.user.id) {
      this.setState({
        isLoaded: false,
      })
      this.updateData()
    }
  }

  render() {
    let videoRender = <div>Страница пользователя</div>

    return (
      <Page>
        <div className="profile-page">
          {!this.state.isLoaded && <Spinner />}
          <div className="fsb header-avatar">
            <Profile {...this.state.user} onClick={() => {}} />
          </div>
          {videoRender}
        </div>
      </Page>
    )
  }
}

export default ProfilePage
