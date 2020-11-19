import React from 'react'
import {Route, Switch} from 'react-router-dom'
import Home from '../pages/home/Home'
import SignIn from '../pages/auth/signIn/SignIn'
import SignUp from '../pages/auth/singUp/SignUp'
import Profile from '../pages/profile/Profile'
import Setting from '../pages/setting/Setting'
import Create from '../pages/help/ticket/Create'
import TicketPage from '../pages/help/ticket/Show'
import CharacterList from '../pages/material/character/List'
import CharacterCreate from '../pages/material/character/Create'
import CharacterEdit from '../pages/material/character/Edit'
import CharacterPage from '../pages/material/character/Show'
import GuildList from '../pages/material/guild/List'
import GuildCreate from '../pages/material/guild/Create'
import GuildEdit from '../pages/material/guild/Edit'
import GuildPage from '../pages/material/guild/Show'
import StoryList from '../pages/material/story/List'
import StoryCreate from '../pages/material/story/Create'
import StoryEdit from '../pages/material/story/Edit'
import StoryPage from '../pages/material/story/Show'
import AdminDashboard from '../pages/admin/dashboard/AdminDashboard'
import ListOfAdmins from '../pages/admin/listOfAdmins/ListOfAdmins'
import ReportCreate from '../pages/material/report/Create'
import ReportEdit from '../pages/material/report/Edit'
import ReportList from '../pages/material/report/List'
import ReportPage from '../pages/material/report/Show'
import ForumCreate from '../pages/material/forum/Create'
import ForumEdit from '../pages/material/forum/Edit'
import ForumList from '../pages/material/forum/List'
import ForumPage from '../pages/material/forum/Show'
import TicketTypeList from '../pages/help/ticket/list/TypeList'
import TicketList from '../pages/help/ticket/list/List'
import FeedbackList from '../pages/help/feedback/List'
import RulePage from '../pages/start/rule/Rule'
import HowPage from '../pages/start/how/How'
import ArticleList from '../pages/article/List'
import ArticleCreate from '../pages/article/Create'
import ArticleEdit from '../pages/article/Edit'
import ArticlePage from '../pages/article/Show'
import NotFound from '../pages/notFound/NotFound'
import SearchPage from '../pages/material/search/Search'

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

            <Route exact path="/start/how" component={HowPage}/>
            <Route exact path="/start/rule" component={RulePage}/>

            <Route exact path="/article" component={ArticleList}/>
            <Route exact path="/article/create"
                   render={(props) => (
                       <ArticleCreate {...props} scrollTop={scrollTop}/>)}/>
            <Route path="/article/edit/:id"
                   render={(props) => (
                       <ArticleEdit {...props} scrollTop={scrollTop}/>)}/>
            <Route path="/article/:id" component={ArticlePage}/>

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

            <Route path="/material/search" component={SearchPage}/>

            <Route exact path="/help/feedback" component={FeedbackList}/>

            <Route exact path="/help/ticket/type"
                   component={TicketTypeList}/>{/*категории тикетов*/}
            <Route path="/help/ticket/type/:id"
                   component={TicketList}/> {/*тикеты конкретной категории*/}
            <Route path="/help/ticket/create"
                   render={(props) => (
                       <Create {...props} scrollTop={scrollTop}/>)}/>{/*создание тикета*/}
            <Route path="/help/ticket/:id" component={TicketPage}/>{/*конкретный тикет*/}

            <Route exact path="/admin" component={AdminDashboard}/>
            <Route path="/admin/list" component={ListOfAdmins}/>
            <Route path="/*" component={NotFound}/>
        </Switch>
    )
}

export default Routes