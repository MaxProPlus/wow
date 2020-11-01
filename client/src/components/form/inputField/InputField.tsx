import React from 'react'
import Form from '../Form'

const InputField = ({label, type, value, id, onChange, placeholder}: any) => {
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