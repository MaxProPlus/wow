import React, {FC, FormEvent} from "react"
import styles from './SearchBlock.module.scss'

type P = {
    children: any
    show: boolean
    onSubmit: (e: FormEvent<HTMLFormElement>) => void
}

const SearchBlock: FC<P> = ({children, show, onSubmit}) => {

    if (!show) {
        return null
    }

    return (
        <form className={styles.block} onSubmit={onSubmit}>{children}</form>
    )
}

export default SearchBlock