import React from 'react'
import styles from './AlertAccept.module.scss'

type P = {
  children: React.ReactNode
}

const AlertAccept: React.FC<P> = (props) => {
  return (
    <>
      {props.children && <div className={styles.block}>{props.children}</div>}
    </>
  )
}

export default AlertAccept
