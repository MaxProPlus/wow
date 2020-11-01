import React from 'react'

const InputCheckBox = ({label, checked, id, onChange}: any) => {
    return (
        <div className="form-group">
            <label><input id={id} name={id} onChange={onChange}
                          checked={checked} type="checkbox"/>{label}</label>
        </div>
    )
}

export default InputCheckBox