import React from 'react'

type P = {
  id: string
  label: string
  checked: number | boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const InputCheckBox: React.FC<P> = ({label, checked, id, onChange}) => {
  return (
    <div className="form-group">
      <label>
        <input
          id={id}
          name={id}
          onChange={onChange}
          checked={!!checked}
          type="checkbox"
        />
        {label}
      </label>
    </div>
  )
}

export default InputCheckBox
