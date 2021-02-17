import React from 'react'
import Form from '../Form'

type P = {
    id?: string
    value: number
    label: string
    placeholder?: string // todo реализовать плейсхолдер для select?
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    children: React.ReactNode
}

const Select: React.FC<P> = ({label, value, id, onChange, children}) => {
    return (
        <Form.Group>
            <Form.Label htmlFor={id}>{label}</Form.Label>
            <Form.Select id={id} name={id} value={value} onChange={onChange}>{children}</Form.Select>
        </Form.Group>
    )
}

export default Select