import React from 'react'
import './AlertDanger.scss'

type P = {
  children: React.ReactNode
}

const AlertDanger: React.FC<P> = (props) => {
  return (
    <>
      {props.children && <div className="alert-danger">{props.children}</div>}
    </>
  )
}

export default AlertDanger
