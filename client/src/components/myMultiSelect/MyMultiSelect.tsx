import React, {ChangeEvent, FC} from 'react'
import closeSvg from './img/close.svg'
import Spinner from '../spinner/Spinner'
import {MyMultiSelectInputEvent, MyMultiSelectListEvent} from './types'
import './MyMultiSelect.scss'

type P = {
  id: string
  label: string
  placeholder: string
  options: {label: string; value: number}[]
  value: {label: string; value: number}[]
  onChange: (e: MyMultiSelectInputEvent) => Promise<any>
  onAdd: (e: MyMultiSelectListEvent) => void
  onRemove: (e: MyMultiSelectListEvent) => void
}

type S = {
  inputValue: string
  isLoaded: boolean
}

class MyMultiSelect extends React.Component<P, S> {
  constructor(props: P) {
    super(props)
    this.state = {
      inputValue: '',
      isLoaded: true,
    }
  }

  handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      inputValue: e.target.value,
      isLoaded: false,
    })
    this.props
      .onChange({
        id: this.props.id,
        value: e.target.value,
      })
      .finally(() => {
        this.setState({
          isLoaded: true,
        })
      })
  }

  handleRemove = (value: number) => {
    this.props.onRemove({
      id: this.props.id,
      value,
      label: '',
    })
  }

  handleAdd = (value: number, label: string) => {
    this.props.onAdd({
      id: this.props.id,
      value,
      label,
    })
    this.handleChange({
      target: {
        value: '',
      },
    } as any)
  }

  render() {
    return (
      <div>
        <label className="my-multi-select__label" htmlFor={this.props.id}>
          {this.props.label}
        </label>
        <div className="my-multi-select">
          {!!this.props.value.length && (
            <div className="d-flex flex-wrap my-multi-select__options my-multi-select__values">
              {this.props.value.map((el) => (
                <BlockValue
                  key={el.value}
                  value={el.value}
                  onClose={this.handleRemove}
                >
                  {el.label}
                </BlockValue>
              ))}
            </div>
          )}

          <input
            id={this.props.id}
            className="my-multi-select__input"
            placeholder={this.props.placeholder}
            type="text"
            value={this.state.inputValue}
            onChange={this.handleChange}
          />

          {!this.state.isLoaded && (
            <div className="my-multi-select__options my-multi-select__spinner">
              <Spinner />
            </div>
          )}
          {!!this.props.options.length && this.state.isLoaded && (
            <div className="d-flex flex-column align-items-start my-multi-select__options">
              {this.props.options.map((el) => (
                <BlockOptions
                  key={el.value}
                  value={el.value}
                  onClick={this.handleAdd}
                >
                  {el.label}
                </BlockOptions>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
}

type BlockValueP = {
  children: string
  value: number
  onClose: (value: number) => void
}

// Компонент выбранного элемента
const BlockValue: FC<BlockValueP> = ({
  children,
  value,
  onClose,
}: BlockValueP) => {
  return (
    <span className="my-multi-select__item">
      {children}
      <img onClick={() => onClose(value)} src={closeSvg} alt="" />
    </span>
  )
}

type BlockOptionsP = {
  children: string
  value: number
  onClick: (value: number, label: string) => void
}

// Компонент элемента поиска
const BlockOptions: FC<BlockOptionsP> = ({
  children,
  value,
  onClick,
}: BlockOptionsP) => {
  return (
    <span
      className="my-multi-select__item my-multi-select__option"
      onClick={() => onClick(value, children)}
    >
      {children}
    </span>
  )
}

export default MyMultiSelect
