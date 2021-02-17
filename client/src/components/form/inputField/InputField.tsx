import React from 'react'
import Form from '../Form'

type P = {
    id: string
    value?: string | number
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    label: string
    placeholder?: string
    type: string
}

const InputField: React.FC<P> = ({label, type, value, id, onChange, placeholder}) => {
    return (
        <Form.Group>
            <Form.Label htmlFor={id}>{label}</Form.Label>
            <Form.Input type={type} id={id} name={id}
                        value={value}
                        placeholder={placeholder}
                        onChange={onChange}/>
        </Form.Group>
    )
}

export default InputField