import React from "react"
import Button from "components/button/Button"
import styles from './Search.module.scss'

type P = {
    href: string
    icon: string
    children: any
}

const ButtonIcon = ({href, children, icon}: P) => {

    return (
        <Button to={href}><img className={styles.icon} src={icon} alt=""/><span
            className={styles.text}>{children}</span></Button>
    )
}

export default ButtonIcon