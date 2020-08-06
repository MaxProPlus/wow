import React from "react"

const InputCheckBox = ({label, value, id, onChange}: any) => {
    return (
        <div className="form-group">
            <label><input id={id} name={id} onChange={onChange}
                          value={value} type="checkbox"/>{label}</label>
        </div>
    )
}

export default InputCheckBox