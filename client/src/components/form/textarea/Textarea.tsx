import React from 'react'
import Form from '../Form'

type P = {
  id: string
  value: string
  label: string
  placeholder?: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  rows?: number
}

const Textarea: React.FC<P> = ({
  label,
  value,
  id,
  onChange,
  placeholder,
  rows,
}) => {
  return (
    <Form.Group>
      <Form.Label htmlFor={id}>{label}</Form.Label>
      <Form.TextArea
        id={id}
        value={value}
        name={id}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
      />
    </Form.Group>
  )
}

export default Textarea
