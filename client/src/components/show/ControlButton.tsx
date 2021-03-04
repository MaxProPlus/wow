import React from 'react'
import Button from '../button/Button'
import penIcon from '../../img/pen.svg'
import trashIcon from '../../img/trash.svg'
import './ControlButton.scss'

type P = {
  show: boolean
  id: string
  href: string
  nameRemove: string
  showRemoveWindow: () => void
}

const ControlButton: React.FC<P> = ({
  show,
  id,
  href,
  nameRemove,
  showRemoveWindow,
}) => {
  if (!show) {
    return null
  }

  return (
    <>
      <Button to={`${href}/edit/${id}`}>
        <img className="control-button__icon" src={penIcon} alt="" />
        <span className="control-button__text">Редактировать</span>
      </Button>
      <Button className="control-button__trash" onClick={showRemoveWindow}>
        <img className="control-button__icon" src={trashIcon} alt="" />
        <span className="control-button__text">{nameRemove}</span>
      </Button>
    </>
  )
}

export default ControlButton
