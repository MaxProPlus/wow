import React, {FC} from 'react'
import styles from './List.module.scss'
import {Link} from 'react-router-dom'

type P = {
    title: string
    href: string
    list: any[]
}

const List: React.FC<P> = ({title, href, list}) => {
    if (!list.length) {
        return null
    }
    return (
        <>
            <div className={styles.title}>{title}</div>
            <div className={styles.block}>
                {list.map(el =>
                    (<Value key={el.id} href={href + el.id} hidden={el.hidden}>{el.title}</Value>),
                )}
            </div>
        </>
    )
}

type ValueP = {
    href: string
    hidden: number
    children: string
}

const Value: FC<ValueP> = ({href, hidden, children}) => {
    return (
        <Link className={styles.value} to={href}>
            {!!hidden && <span className={styles.hidden}>СКРЫТО </span>}
            {children}
        </Link>
    )
}

export default List