import React from "react"
import Button from "../button/Button"
import penIcon from '../../img/pen.svg'
import trashIcon from '../../img/trash.svg'
import styles from './ControlButton.module.scss'

type P = {
    show: boolean
    id: string
    type: string
    nameRemove: string
    showRemoveWindow: () => void
}

const ControlButton = ({show, id, type, nameRemove, showRemoveWindow}: P) => {

    if (!show) {
        return null
    }

    return (
        <>
            <Button to={`/material/${type}/edit/${id}`}><img className={styles.icon} src={penIcon} alt=""/><span
                className={styles.text}>Редактировать</span></Button>
            <Button className={styles.trash} onClick={showRemoveWindow}><img className={styles.icon} src={trashIcon}
                                                                             alt=""/><span
                className={styles.text}>Удалить {nameRemove}</span></Button>
        </>
    )
}

export default ControlButton