import React from "react"
import Form from "../Form"

const Textarea = ({label, value, id, onChange, placeholder, rows}: any) => {
    return (
        <Form.Group>
            <Form.Label htmlFor={id}>{label}</Form.Label>
            <Form.TextArea id={id} value={value} name={id}
                           onChange={onChange}
                           placeholder={placeholder}
                           rows={rows}/>

        </Form.Group>
    )
}

export default Textarea