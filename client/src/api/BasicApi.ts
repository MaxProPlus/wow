class Api {

    // post
    post(url: string, body: any) {
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(r => {
            if (!r.ok) {
                return {
                    status: 'ERROR_SERVER',
                    errorMessage: `${r.status} ${r.statusText}`,
                }
            }
            return r.json()
        })
    }

    // post
    postForm(url: string, body: FormData) {
        return fetch(url, {
            method: 'POST',
            body: body,
        }).then(r => {
            if (!r.ok) {
                return {
                    status: 'ERROR_SERVER',
                    errorMessage: `${r.status} ${r.statusText}`,
                }
            }
            return r.json()
        })
    }

    // put
    putForm(url: string, body: FormData) {
        return fetch(url, {
            method: 'PUT',
            body: body,
        }).then(r => {
            if (!r.ok) {
                return {
                    status: 'ERROR_SERVER',
                    errorMessage: `${r.status} ${r.statusText}`,
                }
            }
            return r.json()
        })
    }

    // get
    get(url: string) {
        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(r => {
            if (!r.ok) {
                return {
                    status: 'ERROR_SERVER',
                    errorMessage: `${r.status} ${r.statusText}`,
                }
            }
            return r.json()
        })
    }

    // delete
    delete(url: string) {
        return fetch(url, {
            method: 'delete',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(r => {
            if (!r.ok) {
                return {
                    status: 'ERROR_SERVER',
                    errorMessage: `${r.status} ${r.statusText}`,
                }
            }
            return r.json()
        })
    }

}

export default Api