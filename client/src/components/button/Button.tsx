import React from 'react'
import {Link} from 'react-router-dom'
import './Button.scss'

type P = {
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  className?: string
  block?: boolean
  to?: string
  as?: React.ElementType
  children?: React.ReactNode
}

const Button: React.FC<P> = (props) => {
  let className = 'btn'
  if (props.className) {
    className += ' ' + props.className
  }
  if (props.block) {
    className += ' btn-block'
  }
  let Tag: React.ElementType = props.to ? Link : 'button'
  if (props.as) {
    Tag = props.as
  }
  return (
    <Tag {...props} className={className}>
      {props.children}
    </Tag>
  )
}

export default Button
