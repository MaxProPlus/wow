import React, {FC, FormEvent} from 'react'
import styles from './SearchFilter.module.scss'
import Accordion from '../accordion/Accordion'

type P = {
    children: React.ReactNode
    show: boolean
    onSubmit: (e: FormEvent<HTMLFormElement>) => void
}

const SearchFilter: FC<P> = ({children, show, onSubmit}) => {
    return (
        <Accordion isActive={show} className={styles.blockAccordion}>
            <form className={styles.block} onSubmit={onSubmit}>
                {children}
            </form>
        </Accordion>
    )
}

export default SearchFilter