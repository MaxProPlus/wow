import {User, UserPassword} from "../../../server/src/common/entity/types"
import Api from "./BasicApi"

class UserApi extends Api {
    updateGeneral(profile: User) {
        const url = '/api/users/general'
        return this.post(url, profile).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results[0]
        })
    }

    updateAvatar(avatar: FormData) {
        const url = '/api/users/avatar'
        return this.postForm(url, avatar).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return Promise.resolve()
        })
    }

    updateSecure(user: User) {
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
    }

    getGeneral() {
        const url = '/api/users/general'
        return this.get(url).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return Promise.resolve(r.results[0])
        })
    }

    signIn(user: User) {
        const url = '/api/users/signin'
        return this.post(url, user).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return Promise.resolve()
        })
    }

    // api подтверждение регистрации
    acceptEmail(token: string) {
        const url = `/api/users/accept/reg?token=${token}`
        return this.get(url).then(r => {
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

    signup(user: User) {
        const url = '/api/users/signup'
        return this.post(url, user).then(r => {
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

    getAll(limit: number, page: number, data?: any) {
        let url = `/api/users?limit=${limit}&page=${page}`
        if (!!data) {
            for (let key in data) {
                url += `&${key}=${data[key]}`
            }
        }
        return this.get(url).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results
        })
    }
}

export default UserApi