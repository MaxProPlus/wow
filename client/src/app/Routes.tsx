import React, {Suspense} from 'react'
import {Route, Switch} from 'react-router-dom'
import Spinner from '../components/spinner/Spinner'

const Home = React.lazy(() => import('../pages/home/Home'))
const SignIn = React.lazy(() => import('../pages/auth/signIn/SignIn'))
const SignUp = React.lazy(() => import('../pages/auth/singUp/SignUp'))
const Profile = React.lazy(() => import('../pages/profile/Profile'))
const Setting = React.lazy(() => import('../pages/setting/Setting'))
const Create = React.lazy(() => import('../pages/help/ticket/Create'))
const TicketPage = React.lazy(() => import('../pages/help/ticket/Show'))
const CharacterList = React.lazy(() => import('../pages/material/character/List'))
const CharacterCreate = React.lazy(() => import('../pages/material/character/Create'))
const CharacterEdit = React.lazy(() => import('../pages/material/character/Edit'))
const CharacterPage = React.lazy(() => import('../pages/material/character/Show'))
const GuildList = React.lazy(() => import('../pages/material/guild/List'))
const GuildCreate = React.lazy(() => import('../pages/material/guild/Create'))
const GuildEdit = React.lazy(() => import('../pages/material/guild/Edit'))
const GuildPage = React.lazy(() => import('../pages/material/guild/Show'))
const StoryList = React.lazy(() => import('../pages/material/story/List'))
const StoryCreate = React.lazy(() => import('../pages/material/story/Create'))
const StoryEdit = React.lazy(() => import('../pages/material/story/Edit'))
const StoryPage = React.lazy(() => import('../pages/material/story/Show'))
const AdminDashboard = React.lazy(() => import('../pages/admin/dashboard/AdminDashboard'))
const ListOfAdmins = React.lazy(() => import('../pages/admin/listOfAdmins/ListOfAdmins'))
const ReportCreate = React.lazy(() => import('../pages/material/report/Create'))
const ReportEdit = React.lazy(() => import('../pages/material/report/Edit'))
const ReportList = React.lazy(() => import('../pages/material/report/List'))
const ReportPage = React.lazy(() => import('../pages/material/report/Show'))
const ForumCreate = React.lazy(() => import('../pages/material/forum/Create'))
const ForumEdit = React.lazy(() => import('../pages/material/forum/Edit'))
const ForumList = React.lazy(() => import('../pages/material/forum/List'))
const ForumPage = React.lazy(() => import('../pages/material/forum/Show'))
const TicketTypeList = React.lazy(() => import('../pages/help/ticket/list/TypeList'))
const TicketList = React.lazy(() => import('../pages/help/ticket/list/List'))
const FeedbackList = React.lazy(() => import('../pages/help/feedback/List'))
const RulePage = React.lazy(() => import('../pages/start/rule/Rule'))
const HowPage = React.lazy(() => import('../pages/start/how/How'))
const ArticleList = React.lazy(() => import('../pages/article/List'))
const ArticleCreate = React.lazy(() => import('../pages/article/Create'))
const ArticleEdit = React.lazy(() => import('../pages/article/Edit'))
const ArticlePage = React.lazy(() => import('../pages/article/Show'))
const NotFound = React.lazy(() => import('../pages/notFound/NotFound'))
const SearchPage = React.lazy(() => import('../pages/material/search/Search'))

type P = {
    scrollTop: () => void
}

const Routes = ({scrollTop}: P) => {
    return (
        <Suspense fallback={<Spinner/>}>
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
        </Suspense>
    )
}

export default Routes