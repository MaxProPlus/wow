import React, {ChangeEvent, FormEvent, MouseEvent} from 'react'
import searchIcon from '../../img/search.svg'
import filterIcon from '../../img/filter.svg'
import './SearchInput.scss'

type P = {
    placeholder: string
    value: string
    id: string
    toggle?: () => void
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
    onSubmit: (e: FormEvent<HTMLFormElement> | MouseEvent<HTMLImageElement, globalThis.MouseEvent>) => void
}

const SearchInput: React.FC<P> = ({placeholder, value, id, toggle, onChange, onSubmit}) => {

    return (
        <form className="search-form" onSubmit={onSubmit}>
            <img className="search-form__filter" src={filterIcon} alt="" onClick={toggle}/>
            <input id={id} className="search-form__input" type="text" placeholder={placeholder} value={value}
                   onChange={onChange}/>
            <img className="search-form__submit" src={searchIcon} alt="" onClick={onSubmit}/>
        </form>
    )
}

export default SearchInput