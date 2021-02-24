import React from 'react'
import Spinner from '../../../components/spinner/Spinner'
import UserContext from '../../../contexts/userContext'
import {Link} from 'react-router-dom'

type S = {
  isLoaded: true
}

class AdminDashboard extends React.Component<{}, S> {
  static contextType = UserContext

  constructor(props: any) {
    super(props)
    this.state = {
      isLoaded: true,
    }
  }

  componentDidMount() {}

  render() {
    return (
      <div>
        {!this.state.isLoaded && <Spinner />}
        <div className="page-admin_dashboard">
          админка <br />
          <Link to="/admin/list">Список админов</Link>
        </div>
      </div>
    )
  }
}

export default AdminDashboard
