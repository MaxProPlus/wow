import React from 'react'
import styles from './Card.module.scss'
import {Row} from 'react-bootstrap'
import Block from '../list/Block'

type P = {
    title: string
    href: string
    list: any[]
}

const Card: React.FC<P> = ({title, href, list}) => {
    if (!list.length) {
        return null
    }
    return (
        <div>
            <div className={styles.title}>{title}</div>
            <Row>
                {list.map(el =>
                    (<Block key={el.id} id={el.id}
                            urlAvatar={el.urlAvatar} href={href} size={2}/>),
                )}
            </Row>
        </div>
    )
}

export default Card