import React from "react"
import styles from './Avatar.module.scss'

type P = {
    src: string
}
const Avatar = ({src}: P) => {
    return (
        <img className={styles.img} src={src} alt=""/>
    )
}

export default Avatar