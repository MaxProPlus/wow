import React from "react"

const Select = ({label, value, id, onChange, children}: any) => {
    return (
        <div className="form-group">
            <label htmlFor={id}>{label}</label>
            <select id={id} name={id} value={value} onChange={onChange}>
                {children}
            </select>
        </div>
    )
}

export default Select