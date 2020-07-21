import React from 'react'
import {Route, Router, Switch} from "react-router-dom"
import history from "utils/history"
import './App.scss'
import Header from "components/header/Header"
import Profile from "pages/profile/Profile"
import Home from "pages/home/Home"
import Setting from "pages/setting/Setting"
import SignIn from "pages/signIn/SignIn"
import SignUp from "pages/singUp/SignUp"
import UserApi from "api/userApi"
import UserContext from "utils/userContext"
import {Account} from "../../../server/src/common/entity/types"
import Footer from "../components/footer/Footer"
import TicketTypeList from "../pages/ticketTypeList/TicketTypeList";
import TicketsByType from "../pages/ticketsByType/TicketsByType";
import TicketCreate from "../pages/ticketCreate/TicketCreate";
import TicketPage from "../pages/ticket/TicketPage";
import HeaderTop from "../components/headerTop/HeaderTop";

let getCookie = (name: string) => {
    let matches = document.cookie.match(new RegExp(
        // eslint-disable-next-line no-useless-escape
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ))
    return matches ? decodeURIComponent(matches[1]) : undefined
}

interface IState {
    isLoaded: boolean
    user: Account
    showMenu: boolean
}

class App extends React.Component<{}, IState> {
    private userApi = new UserApi();
    private wrapperRef?: HTMLElement

    constructor(props: {}) {
        super(props)
        this.state = {
            isLoaded: false,
            user: new Account(),
            showMenu: false,
        }
    }

    updateLogin = () => {
        let token = getCookie('token')
        if (!token) {
            this.setState({
                user: new Account()
            })
            return
        }
        this.userApi.getContext().then(r => {
            if (r.status !== 'OK') {
                return
            }
            this.setState((state) => {
                return {
                    user: {
                        ...state.user,
                        ...r.results[0],
                    }
                }
            })
        })
    };

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside)
        this.updateLogin()
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside)
    }

    handleClickOutside = (e: any) => {
        if (this.wrapperRef && !this.wrapperRef.contains(e.target)) {
            this.hideMenu()
        }
    };

    handleToggleMenu = (e:any) => {
        this.setState((prevState: Readonly<IState>, props: Readonly<{}>)=>{
            return {
                showMenu: !prevState.showMenu,
            }
        })
    }

    hideMenu = () => {
        this.setState({showMenu: false})
    };

    setWrapperRef = (node: HTMLElement) => {
        this.wrapperRef = node
    };

    render() {
        return (
            <Router history={history}>
                <UserContext.Provider value={{user: this.state.user, updateLogin: this.updateLogin}}>
                    <div className="app">
                        <Header ref={this.setWrapperRef} showMenu={this.state.showMenu} hideMenu={this.hideMenu}/>
                        <div className="container">
                            <div className="container-inner">
                                <HeaderTop onClickMenu={this.handleToggleMenu}/>
                                <div className="page">
                                    <Switch>
                                        <Route exact path="/" component={Home}/>
                                        <Route path="/login" component={SignIn}/>
                                        <Route path="/signup" component={SignUp}/>
                                        <Route path="/profile/:id" component={Profile}/>
                                        <Route path="/setting" component={Setting}/>
                                        <Route path="/ticket/type/list" component={TicketTypeList}/>{/*категории тикетов*/}
                                        <Route path="/ticket/type/:id"
                                               component={TicketsByType}/> {/*тикеты конкретной категории*/}
                                        <Route path="/ticket/create" component={TicketCreate}/>{/*создание тикета*/}
                                        <Route path="/ticket/:id" component={TicketPage}/>{/*конкретный тикет*/}
                                        <Route path="/*">Страница не найдена или еще не создана ¯\_(ツ)_/¯</Route>
                                    </Switch>
                                </div>
                            </div>
                        </div>
                        {/*<Footer/>*/}
                    </div>
                </UserContext.Provider>
            </Router>
        )
    }
}

export default App
