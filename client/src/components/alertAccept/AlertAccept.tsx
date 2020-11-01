import React from 'react'
import styles from './AlertAccept.module.scss'

const AlertAccept = (props: any) => {
    return (
        <>{props.children && <div className={styles.block}>{props.children}</div>}</>
    )
}

export default AlertAccept