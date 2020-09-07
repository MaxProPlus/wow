import React, {FC} from "react"
import styles from './List.module.scss'
import {Link} from "react-router-dom"

type P = {
    title: string
    href: string
    list: any[]
}

const List = ({title, href, list}: P) => {
    if (!list.length) {
        return null
    }
    return (
        <>
            <div className={styles.title}>{title}</div>
            <div className={styles.block}>
                {list.map(el =>
                    (<Value key={el.id} href={href + el.id}>{el.title}</Value>)
                )}
            </div>
        </>
    )
}

type ValueP = {
    href: string
    children: string
}

const Value: FC<ValueP> = ({href, children}) => {
    return (
        <Link className={styles.value} to={href}>
            {children}
        </Link>
    )
}

export default List