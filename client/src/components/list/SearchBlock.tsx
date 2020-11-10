import React, {ChangeEvent, FormEvent, MouseEvent} from 'react'
import Button from 'components/button/Button'
import penIcon from '../../img/pen.svg'
import SearchInput from './SearchInput'
import styles from './SearchBlock.module.scss'

type P = {
    href: string
    text: string
    placeholder: string
    value: string
    id: string
    toggle: () => void
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
    onSubmit: (e: FormEvent<HTMLFormElement> | MouseEvent<HTMLImageElement, globalThis.MouseEvent>) => void
}

const SearchBlock = ({href, text, placeholder, value, id, toggle, onChange, onSubmit}: P) => {

    return (
        <>
            <SearchInput id={id} placeholder={placeholder} value={value} onChange={onChange} onSubmit={onSubmit}
                         toggle={toggle}/>
            <Button to={href}><img className={styles.icon} src={penIcon} alt=""/><span
                className={styles.text}>{text}</span></Button>
        </>
    )
}

export default SearchBlock