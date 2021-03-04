import React from 'react'
import './ConfirmationWindow.scss'
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
      <div className="confirmation-window__body">
        <Button className="confirmation-window__btn " onClick={onDecline}>
          Нет
        </Button>
        <Button className="confirmation-window__btn " onClick={onAccept}>
          Да
        </Button>
      </div>
    </ModalWindow>
  )
}

export default ConfirmationWindow
