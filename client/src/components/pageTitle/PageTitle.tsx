import React from 'react'
import './PageTitle.scss'

type P = {
  icon?: string
  title: string
  children?: React.ReactNode
  className?: string
}
const PageTitle: React.FC<P> = ({title, icon, children, className}) => {
  let blockClass = 'page-title'
  if (className) {
    blockClass += ' ' + className
  }

  return (
    <div className={blockClass}>
      <h1>
        <img src={icon} alt="" />
        <span>{title}</span>
      </h1>
      <div className="d-flex justify-content-end">{children}</div>
    </div>
  )
}

export default PageTitle
