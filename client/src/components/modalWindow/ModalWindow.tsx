import React from 'react'
import './ModalWindow.scss'

type P = {
  title: string
  show: boolean
  children: React.ReactNode
}

const ModalWindow: React.FC<P> = ({title, children, show}) => {
  if (!show) {
    return null
  }
  return (
    <div className="modal-window__wrapper">
      <div className="modal-window">
        <div className="modal-window__title">{title}</div>
        {children}
      </div>
    </div>
  )
}

export default ModalWindow
