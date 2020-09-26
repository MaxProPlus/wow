import React, {FC, FormEvent} from "react"
import styles from './SearchBlock.module.scss'
import Accordion from "../accordion/Accordion"

type P = {
    children: any
    show: boolean
    onSubmit: (e: FormEvent<HTMLFormElement>) => void
}

const SearchBlock: FC<P> = ({children, show, onSubmit}) => {
    return (
        <Accordion isActive={show} className={styles.blockAccordion}>
            <form className={styles.block} onSubmit={onSubmit}>
                {children}
            </form>
        </Accordion>
    )
}

export default SearchBlock