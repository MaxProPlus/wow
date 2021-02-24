// tslint:disable-next-line:no-namespace
import {User} from '../common/entity/types'

declare global {
  namespace Express {
    interface Request {
      user?: User | null
    }
  }
}
