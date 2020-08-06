import React from "react"
import Form from "../Form";

const Select = ({label, value, id, onChange, children}: any) => {
    return (
        <Form.Group>
            <Form.Label htmlFor={id}>{label}</Form.Label>
            <Form.Select id={id} name={id} value={value} onChange={onChange}>{children}</Form.Select>
        </Form.Group>
    )
}

export default Select