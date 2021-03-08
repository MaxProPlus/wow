import Uploader from './index'
import Hash from '../hash'
import {UploadedFile} from 'express-fileupload'

describe('Uploader', () => {
  let uploader: Uploader
  beforeEach(() => {
    uploader = new Uploader(new Hash(), {} as any)
  })
  test('move', async () => {
    const mv = jest.fn()
    const file: UploadedFile = {
      name: 'photo.png',
      data: Buffer.alloc(1, '0'),
      size: 6505,
      encoding: '7bit',
      tempFilePath: '/tmp/temp-123',
      truncated: false,
      mimetype: 'image/png',
      md5: 'qwerty',
      mv,
    }
    const url = await uploader.move(file, 'tmp')
    expect(mv).toBeCalled()
    expect(url).toMatch(/^\/uploads\/tmp\/\S*\.png$/)
  })
})
