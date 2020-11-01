import React from 'react'
import './AlertDanger.scss'

const AlertDanger = (props: any) => {
    return (
        <>{props.children && <div className="alert-danger">{props.children}</div>}</>
    )
}

export default AlertDanger