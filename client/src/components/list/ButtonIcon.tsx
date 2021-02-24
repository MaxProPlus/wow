import React from 'react'
import Button from 'components/button/Button'
import styles from './SearchBlock.module.scss'

type P = {
  href: string
  icon: string
  children: React.ReactNode
}

const ButtonIcon: React.FC<P> = ({href, children, icon}) => {
  return (
    <Button to={href}>
      <img className={styles.icon} src={icon} alt="" />
      <span className={styles.text}>{children}</span>
    </Button>
  )
}

export default ButtonIcon
