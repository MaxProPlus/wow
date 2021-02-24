import React from 'react'
import styles from './PageTitle.module.scss'

type P = {
  icon?: string
  title: string
  children?: React.ReactNode
  className?: string
}
const PageTitle: React.FC<P> = ({title, icon, children, className}) => {
  let blockClass = styles.block
  if (!!className) {
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
