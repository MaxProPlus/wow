import React from 'react'
import {Router} from "react-router-dom"
import '../css/common.scss'
import './App.scss'
import history from "utils/history"
import Header from "components/header/Header"
import UserApi from "api/UserApi"
import UserContext from "utils/userContext"
import {Account} from "../../../server/src/common/entity/types"
import HeaderTop from "../components/headerTop/HeaderTop"
import Routes from "./Routes"
import Cookie from "../utils/cookie"

interface IState {
    isLoaded: boolean
    showMenu: boolean
    user: Account
}

class App extends React.Component<{}, IState> {
    private userApi = new UserApi()
    private wrapperRef?: HTMLElement
    private containerRef?: HTMLElement

    constructor(props: {}) {
        super(props)
        this.state = {
            isLoaded: false,
            showMenu: false,
            user: new Account(),
        }
    }

    updateLogin = () => {
        let token = Cookie.getCookie('token')
        if (!token) {
            this.setState({
                user: {
                    ...new Account(),
                    id: -1,
                }
            })
            return
        }
        return this.userApi.getContext().then(user => {
            this.setState((state) => {
                return {
                    user: {
                        ...state.user,
                        ...user,
                    }
                }
            })
        }, () => {
            this.setState({
                user: {
                    ...new Account(),
                    id: -1,
                }
            })
        })
    }

    componentDidMount() {
        this.updateLogin()
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside)
    }

    handleClickOutside = (e: any) => {
        if (this.wrapperRef && !this.wrapperRef.contains(e.target)) {
            this.hideMenu()
            document.removeEventListener('mousedown', this.handleClickOutside)
        }
    }

    handleToggleMenu = () => {
        this.setState({showMenu: true})
        document.addEventListener('mousedown', this.handleClickOutside)
    }

    hideMenu = () => {
        this.setState({showMenu: false})
    }

    scrollTop = () => {
        if (!!this.containerRef) {
            this.containerRef.scrollTo(0, 0)
        }
    }

    setWrapperRef = (node: HTMLElement) => {
        this.wrapperRef = node
    }

    setContainerRef = (node: HTMLDivElement) => {
        this.containerRef = node
    }

    render() {
        return (
            <Router history={history}>
                <UserContext.Provider value={{user: this.state.user, updateLogin: this.updateLogin}}>
                    <div className="app">
                        <Header ref={this.setWrapperRef} showMenu={this.state.showMenu} hideMenu={this.hideMenu}/>
                        <div ref={this.setContainerRef} className="my-container">
                            <HeaderTop onClickMenu={this.handleToggleMenu}/>
                            <div className="container-inner">
                                <div className="page">
                                    <Routes scrollTop={this.scrollTop}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </UserContext.Provider>
            </Router>
        )
    }
}

export default App
