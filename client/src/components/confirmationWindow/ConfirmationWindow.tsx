import React from 'react'
import styles from './ConfirmationWindow.module.scss'
import ModalWindow from '../modalWindow/ModalWindow'
import Button from '../button/Button'

type P = {
  title: string
  show: boolean
  onAccept: () => void
  onDecline: () => void
}

const ConfirmationWindow: React.FC<P> = ({
  title,
  show,
  onAccept,
  onDecline,
}) => {
  if (!show) {
    return null
  }
  return (
    <ModalWindow title={title} show={true}>
      <div className={styles.body}>
        <Button className={styles.btn} onClick={onDecline}>
          Нет
        </Button>
        <Button className={styles.btn} onClick={onAccept}>
          Да
        </Button>
      </div>
    </ModalWindow>
  )
}

export default ConfirmationWindow
