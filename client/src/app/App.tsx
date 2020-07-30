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
import TypesOfTicket from "../pages/typesOfTicket/TypesOfTicket";
import TicketsByType from "../pages/ticketsByType/TicketsByType";
import TicketCreate from "../pages/ticketCreate/TicketCreate";
import TicketPage from "../pages/ticket/TicketPage";
import HeaderTop from "../components/headerTop/HeaderTop";
import AdminDashboard from "../pages/admin/dashboard/AdminDashboard";
import ListOfAdmins from "../pages/admin/listOfAdmins/ListOfAdmins";

let getCookie = (name: string) => {
    let matches = document.cookie.match(new RegExp(
        // eslint-disable-next-line no-useless-escape
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ))
    return matches ? decodeURIComponent(matches[1]) : undefined
}

interface IState {
    isLoaded: boolean
    showMenu: boolean
    user: Account
}

class App extends React.Component<{}, IState> {
    private userApi = new UserApi();
    private wrapperRef?: HTMLElement

    constructor(props: {}) {
        super(props)
        this.state = {
            isLoaded: false,
            showMenu: false,
            user: new Account(),
        }
    }

    updateLogin = () => {
        let token = getCookie('token')
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

    setWrapperRef = (node: HTMLElement) => {
        this.wrapperRef = node
    }

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
                                        <Route exact path="/ticket/type/list"
                                               component={TypesOfTicket}/>{/*категории тикетов*/}
                                        <Route path="/ticket/type/:id"
                                               component={TicketsByType}/> {/*тикеты конкретной категории*/}
                                        <Route exact path="/ticket/create"
                                               component={TicketCreate}/>{/*создание тикета*/}
                                        <Route path="/ticket/:id" component={TicketPage}/>{/*конкретный тикет*/}

                                        <Route exact path="/admin" component={AdminDashboard}/>
                                        <Route path="/admin/list" component={ListOfAdmins}/>
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
