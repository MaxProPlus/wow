import React, {ChangeEvent, FormEvent, MouseEvent} from "react"
import Button from "components/button/Button"
import styles from './Search.module.scss'
import penIcon from "../../img/pen.svg"
import searchIcon from "../../img/search.svg"
import filterIcon from "../../img/filter.svg"

type P = {
    href: string
    text: string
    placeholder: string
    value: string
    id?: string
    toggle?: ()=>void
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
    onSubmit: (e: FormEvent<HTMLFormElement> | MouseEvent<HTMLImageElement, globalThis.MouseEvent>) => void
}

const Search = ({href, text, placeholder, value, id, toggle, onChange, onSubmit}: P) => {

    return (
        <>
            <form className={styles.formSearch} onSubmit={onSubmit}>
                <img className={styles.filter} src={filterIcon} alt="" onClick={toggle}/>
                <input id={id} className={styles.input} type="text" placeholder={placeholder} value={value}
                       onChange={onChange}/>
                <img className={styles.search} src={searchIcon} alt="" onClick={onSubmit}/>
            </form>
            <Button to={href}><img className={styles.icon} src={penIcon} alt=""/><span
                className={styles.text}>{text}</span></Button>
        </>
    )
}

export default Search