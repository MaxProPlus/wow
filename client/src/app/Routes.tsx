import React from "react"
import {Route, Switch} from "react-router-dom"
import Home from "../pages/home/Home"
import SignIn from "../pages/signIn/SignIn"
import SignUp from "../pages/singUp/SignUp"
import Profile from "../pages/profile/Profile"
import Setting from "../pages/setting/Setting"
import TypesOfTicket from "../pages/typesOfTicket/TypesOfTicket"
import TicketsByType from "../pages/ticketsByType/TicketsByType"
import TicketCreate from "../pages/ticketCreate/TicketCreate"
import TicketPage from "../pages/ticket/TicketPage"
import CharacterList from "../pages/character/List"
import CharacterCreate from "../pages/character/Create"
import CharacterEdit from "../pages/character/Edit"
import CharacterPage from "../pages/character/Show"
import GuildList from "../pages/guild/List"
import GuildCreate from "../pages/guild/Create"
import GuildEdit from "../pages/guild/Edit"
import GuildPage from "../pages/guild/Show"
import StoryList from "../pages/story/List"
import StoryCreate from "../pages/story/Create"
import StoryEdit from "../pages/story/Edit"
import StoryPage from "../pages/story/Show"
import AdminDashboard from "../pages/admin/dashboard/AdminDashboard"
import ListOfAdmins from "../pages/admin/listOfAdmins/ListOfAdmins"

type P = {
    scrollTop: () => void
}
const Routes = ({scrollTop}: P) => {
    return (
        <Switch>
            <Route exact path="/" component={Home}/>
            <Route path="/login" component={SignIn}/>
            <Route path="/signup" component={SignUp}/>
            <Route path="/profile/:id" component={Profile}/>
            <Route path="/setting" component={Setting}/>
            <Route exact path="/help/ticket/type"
                   component={TypesOfTicket}/>{/*категории тикетов*/}
            <Route path="/help/ticket/type/:id"
                   component={TicketsByType}/> {/*тикеты конкретной категории*/}
            <Route exact path="/help/ticket/create"
                   component={TicketCreate}/>{/*создание тикета*/}
            <Route path="/help/ticket/:id" component={TicketPage}/>{/*конкретный тикет*/}

            <Route exact path="/material/character" component={CharacterList}/>
            <Route exact path="/material/character/create"
                   render={(props) => (
                       <CharacterCreate {...props} scrollTop={scrollTop}/>)}/>
            <Route path="/material/character/edit/:id"
                   render={(props) => (
                       <CharacterEdit {...props} scrollTop={scrollTop}/>)}/>
            <Route path="/material/character/:id" component={CharacterPage}/>

            <Route exact path="/material/guild" component={GuildList}/>
            <Route exact path="/material/guild/create"
                   render={(props) => (
                       <GuildCreate {...props} scrollTop={scrollTop}/>)}/>
            <Route path="/material/guild/edit/:id"
                   render={(props) => (
                       <GuildEdit {...props} scrollTop={scrollTop}/>)}/>
            <Route path="/material/guild/:id" component={GuildPage}/>

            <Route exact path="/material/story" component={StoryList}/>
            <Route exact path="/material/story/create"
                   render={(props) => (
                       <StoryCreate {...props} scrollTop={scrollTop}/>)}/>
            <Route path="/material/story/edit/:id"
                   render={(props) => (
                       <StoryEdit {...props} scrollTop={scrollTop}/>)}/>
            <Route path="/material/story/:id" component={StoryPage}/>

            <Route exact path="/admin" component={AdminDashboard}/>
            <Route path="/admin/list" component={ListOfAdmins}/>
            <Route path="/*">Страница не найдена или еще не создана ¯\_(ツ)_/¯</Route>
        </Switch>
    )
}

export default Routes