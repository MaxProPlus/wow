import React from "react"
import {Route, Switch} from "react-router-dom"
import Home from "../pages/home/Home"
import SignIn from "../pages/signIn/SignIn"
import SignUp from "../pages/singUp/SignUp"
import Profile from "../pages/profile/Profile"
import Setting from "../pages/setting/Setting"
import TicketCreate from "../pages/ticketCreate/TicketCreate"
import TicketPage from "../pages/ticketPage/TicketPage"
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
import ReportCreate from "../pages/report/Create"
import ReportEdit from "../pages/report/Edit"
import ReportList from "../pages/report/List"
import ReportPage from "../pages/report/Show"
import ForumCreate from "../pages/forum/Create"
import ForumEdit from "../pages/forum/Edit"
import ForumList from "../pages/forum/List"
import ForumPage from "../pages/forum/Show"
import TicketTypeList from "../pages/ticket/TypeList"
import TicketList from "../pages/ticket/List"

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

            <Route exact path="/material/report" component={ReportList}/>
            <Route exact path="/material/report/create"
                   render={(props) => (
                       <ReportCreate {...props} scrollTop={scrollTop}/>)}/>
            <Route path="/material/report/edit/:id"
                   render={(props) => (
                       <ReportEdit {...props} scrollTop={scrollTop}/>)}/>
            <Route path="/material/report/:id" component={ReportPage}/>

            <Route exact path="/material/forum" component={ForumList}/>
            <Route exact path="/material/forum/create"
                   render={(props) => (
                       <ForumCreate {...props} scrollTop={scrollTop}/>)}/>
            <Route path="/material/forum/edit/:id"
                   render={(props) => (
                       <ForumEdit {...props} scrollTop={scrollTop}/>)}/>
            <Route path="/material/forum/:id" component={ForumPage}/>

            <Route exact path="/help/ticket/type"
                   component={TicketTypeList}/>{/*категории тикетов*/}
            <Route path="/help/ticket/type/:id"
                   component={TicketList}/> {/*тикеты конкретной категории*/}
            <Route path="/help/ticket/create"
                   render={(props) => (
                       <TicketCreate {...props} scrollTop={scrollTop}/>)}/>{/*создание тикета*/}
            <Route path="/help/ticket/:id" component={TicketPage}/>{/*конкретный тикет*/}

            <Route exact path="/admin" component={AdminDashboard}/>
            <Route path="/admin/list" component={ListOfAdmins}/>
            <Route path="/*">Страница не найдена или еще не создана ¯\_(ツ)_/¯</Route>
        </Switch>
    )
}

export default Routes