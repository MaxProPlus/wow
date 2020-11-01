import React from 'react'
import './Input.scss'
import Form from '../form/Form'

const Input = (props: any) => {
    return (
        <Form.Input
            placeholder={props.placeholder}
            onChange={props.onChange}
            value={props.value}
            id={props.id}
            name={props.id}/>
    )
}

export default Input