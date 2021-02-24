import React from 'react'
import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'
import {Col, Row} from 'react-bootstrap'
import styles from './MyCropper.module.scss'
import Button from '../button/Button'

type P = {
  src: string
  label: string
  ratio: number
  onChange: (dataurl: string) => void
}

type S = {
  image: string
}

export class MyCropper extends React.Component<P, S> {
  cropper?: Cropper
  imageRef: React.RefObject<HTMLImageElement>

  constructor(props: P) {
    super(props)
    this.state = {
      image: props.src,
    }
    this.imageRef = React.createRef()
  }

  componentDidUpdate(prevProps: P, prevState: S) {
    if (prevProps.src !== this.props.src) {
      this.setState({
        image: this.props.src,
      })
    }
  }

  handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    // todo Валидация изображения?
    const files = e.target.files!
    const reader = new FileReader()
    reader.onload = () => {
      this.setState({
        image: reader.result as string,
      })
    }

    reader.readAsDataURL(files[0])
  }

  handleCrop = () => {
    if (typeof this.cropper !== 'undefined') {
      this.props.onChange(this.cropper.getCroppedCanvas().toDataURL())
    }
  }

  handleInitialized = (instance: Cropper) => {
    this.cropper = instance
  }

  handleReady = () => {
    this.cropper!.zoom(-5)
  }

  render() {
    const {ratio, label} = this.props

    return (
      <Row className={styles.block}>
        <Col className={styles.block__crop} xs={6}>
          <Cropper
            style={{height: 300}}
            minCropBoxHeight={10}
            minCropBoxWidth={10}
            viewMode={1}
            initialAspectRatio={ratio}
            aspectRatio={ratio}
            guides={true}
            src={this.state.image}
            ref={this.imageRef}
            crop={this.handleCrop}
            dragMode={'move'}
            checkOrientation={true} // https://github.com/fengyuanchen/cropperjs/issues/671
            onInitialized={this.handleInitialized}
            ready={this.handleReady}
          />
        </Col>
        <Col className={styles.block__handle} xs={6}>
          <h2 className={styles.block__title}>{label}</h2>
          <div className={styles.block__desc}>
            Нажмите кнопку "Загрузить изображение и выберите желаемую фотографию
            в формате JPG или PNG."
          </div>
          <label className={styles.block__btn}>
            <input
              className="d-none"
              type="file"
              onChange={this.handleChangeInput}
            />
            <Button as="div">Загрузить изображение</Button>
          </label>
        </Col>
      </Row>
    )
  }
}

export default MyCropper
