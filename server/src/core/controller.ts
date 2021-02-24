import RightProvider from '../providers/right'
import AuthProvider from '../providers/auth'

class Controller {
  constructor(
    protected rightProvider: RightProvider,
    protected authProvider: AuthProvider
  ) {}
}

export default Controller
