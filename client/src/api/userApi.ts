import {Account, UserPassword} from "../../../server/src/common/entity/types"
import Api from "./basicApi";

class UserApi extends Api {
    updateGeneral(profile: Account) {
        const url = '/api/users/general'
        return this.post(url, profile).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results[0]
        })
    }

    updateAvatar(avatar: FormData) {
        const url = '/api/users/avatar'
        return fetch(url, {
            method: 'POST',
            body: avatar
        }).then(r => {
            if (!r.ok) {
                return {
                    status: "ERROR_SERVER",
                    errorMessage: `${r.status} ${r.statusText}`
                }
            }
            return r.json()
        }).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return Promise.resolve()
        })
    }

    updateSecure(user: Account) {
        const url = '/api/users/secure'
        return this.post(url, user).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return Promise.resolve()
        })
    }

    updatePassword = (user: UserPassword) => {
        const url = '/api/users/password'
        return this.post(url, user).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return Promise.resolve()
        })
    };

    getGeneral() {
        const url = '/api/users/general'
        return this.get(url).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return Promise.resolve(r.results[0])
        })
    }

    signIn(user: Account) {
        const url = '/api/users/signin'
        return this.post(url, user).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return Promise.resolve()
        })
    }

    logout() {
        const url = '/api/users/logout'
        return this.get(url).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return Promise.resolve()
        })
    }

    getContext() {
        const url = '/api/users/context'
        return this.get(url).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results[0]
        })
    }

    signup(account: Account) {
        const url = '/api/users/signup'
        return this.post(url, account).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return Promise.resolve()
        })
    }

    getUser(id: number) {
        const url = '/api/users/' + id
        return this.get(url).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results[0]
        })
    }
}

export default UserApi