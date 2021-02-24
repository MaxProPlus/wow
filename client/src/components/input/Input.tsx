import React from 'react'
import './Input.scss'
import Form from '../form/Form'

type P = {
  id?: string
  value?: string
  placeholder?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const Input: React.FC<P> = (props) => {
  return (
    <Form.Input
      placeholder={props.placeholder}
      onChange={props.onChange}
      value={props.value}
      id={props.id}
      name={props.id}
    />
  )
}

export default Input
