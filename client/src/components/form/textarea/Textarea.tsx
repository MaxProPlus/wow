import React from "react"

const Textarea = ({label, value, id, onChange, rows}: any) => {
    return (
        <div className="form-group">
            <label htmlFor={id}>{label}</label>
            <textarea id={id} value={value} name={id}
                      onChange={onChange}
                      rows={rows || 2}/>
        </div>
    )
}

export default Textarea