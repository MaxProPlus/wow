import React, {ChangeEvent, FormEvent, MouseEvent} from "react"
import Button from "components/button/Button"
import styles from './Search.module.scss'
import penIcon from "../../img/pen.svg"
import searchIcon from "../../img/search.svg"

type P = {
    href: string
    text: string
    placeholder: string
    value: string
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
    onSubmit: (e: FormEvent<HTMLFormElement> | MouseEvent<HTMLImageElement, globalThis.MouseEvent>) => void
}

const Search = ({href, text, placeholder, value, onChange, onSubmit}: P) => {

    return (
        <>
            <form className={styles.formSearch} onSubmit={onSubmit}>
                <input className={styles.input} type="text" placeholder={placeholder} value={value}
                       onChange={onChange}/>
                <img className={styles.search} src={searchIcon} alt="" onClick={onSubmit}/>
            </form>
            <Button to={href}><img className={styles.icon} src={penIcon} alt=""/><span
                className={styles.text}>{text}</span></Button>
        </>
    )
}

export default Search