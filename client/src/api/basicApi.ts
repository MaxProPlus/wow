class Api {

    // post
    post(url: string, body: any) {
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(r => {
            if (!r.ok) {
                return {
                    status: "ERROR_SERVER",
                    errorMessage: `${r.status} ${r.statusText}`
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
            }
        }).then(r => {
            if (!r.ok) {
                return {
                    status: "ERROR_SERVER",
                    errorMessage: `${r.status} ${r.statusText}`
                }
            }
            return r.json()
        })
    }

}

export default Api