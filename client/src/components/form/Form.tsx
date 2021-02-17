import React from 'react'
import './Form.scss'

type PForm = {
    children: React.ReactNode
    className?: string
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

const Form = (props: PForm) => {
    let className = 'form'
    if (props.className) {
        className += ' ' + props.className
    }
    return (
        <form className={className} onSubmit={props.onSubmit}>{props.children}</form>
    )
}

type PGroup = {
    children: React.ReactNode
}

Form.Group = (props: PGroup) => {
    return (
        <div className="form-group">{props.children}</div>
    )
}

type PInput = {
    type?: string
    placeholder?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    value?: string | number
    id?: string
    name?: string
}

Form.Input = (props: PInput) => {
    let className = 'form-control'
    if (props.type === 'file') {
        className = 'form-control-file'
    }
    return (
        <input className={className}
               type={props.type || 'text'}
               placeholder={props.placeholder}
               onChange={props.onChange}
               value={props.value}
               id={props.id}
               name={props.name}
        />
    )
}

type PTextArea = {
    placeholder?: string
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    value: string
    id: string
    name: string
    rows?: number
}

Form.TextArea = (props: PTextArea) => {
    let className = 'form-control'
    return (
        <textarea className={className}
                  placeholder={props.placeholder}
                  onChange={props.onChange}
                  value={props.value}
                  id={props.id}
                  name={props.name}
                  rows={props.rows || 2}
        />
    )
}

type PSelect = {
    children?: React.ReactNode
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    value: string | number
    id?: string
    name?: string
}

Form.Select = (props: PSelect) => {
    let className = 'form-control'
    return (
        <select className={className} onChange={props.onChange} value={props.value} name={props.id}
                id={props.id}>{props.children}</select>
    )
}

type PLabel = {
    children: React.ReactNode
    htmlFor?: string
}

Form.Label = (props: PLabel) => {
    return (
        <label htmlFor={props.htmlFor}>{props.children}</label>
    )
}

export default Form