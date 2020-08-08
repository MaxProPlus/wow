import React from "react"
import './Profile.scss'
import UserContext from "../../utils/userContext"
import UserApi from "../../api/userApi"
import history from "../../utils/history"
import Spinner from "../../components/spinner/Spinner"
import Profile from "../../components/profile/Profile"
import {Account} from "../../../../server/src/common/entity/types"

type stateTypes = {
    isLoaded: boolean
    user: Account
}

class ProfilePage extends React.Component<any, stateTypes> {
    static contextType = UserContext;
    private userApi = new UserApi();

    constructor(props: any) {
        super(props)
        this.state = {
            isLoaded: false,
            user: new Account(),
        }
    }

    static getDerivedStateFromProps(nextProps: any, prevState: stateTypes) {
        if (Number(nextProps.match.params.id) !== prevState.user.id) {
            if (isNaN(Number(nextProps.match.params.id))) {
                history.push('/')
            }
            return {
                user: {
                    id: Number(nextProps.match.params.id)
                }
            }
        }

        return null
    }

    componentDidMount() {
        this.updateData()
    }

    updateData = () => {
        let id = Number(this.props.match.params.id)
        this.userApi.getUser(id).then(r => {
            this.setState({
                user: r,
            })
        }, () => {
            history.push('/')
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<stateTypes>) {
        if (Number(prevProps.match.params.id) !== this.state.user.id) {
            this.setState({
                isLoaded: false,
            })
            this.updateData()
        }
    }

    render() {
        let videoRender = (<div>Страница пользователя</div>)

        return (
            <div className="profile-page">
                {!this.state.isLoaded && <Spinner/>}
                <div className="fsb header-avatar">
                    <Profile
                        {...this.state.user}
                        onClick={() => {
                        }}
                    />
                </div>
                {videoRender}
            </div>
        )
    }
}

export default ProfilePage