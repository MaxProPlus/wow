import React from 'react'
import styles from './Motto.module.scss'

type P = {
  children: React.ReactNode
}

const Motto: React.FC<P> = (props) => {
  return <div className={styles.title}>{props.children}</div>
}

export default Motto
