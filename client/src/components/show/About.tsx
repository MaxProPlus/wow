import React from 'react'
import {User} from '../../../../server/src/common/entity/types'
import DateFormatter from '../../utils/date'

type P = {
  author: string
  coauthors?: User[]
  createdAt: Date
  updatedAt: Date
}

const About: React.FC<P> = ({author, coauthors = [], createdAt, updatedAt}) => {
  return (
    <div className="mb-3">
      <div>
        <span>Автор: </span>
        <span className="text-muted">
          {author}
          {coauthors.map((el) => (
            <span key={el.id}>, {el.nickname}</span>
          ))}
        </span>
      </div>
      <div>
        <span>Создано: </span>
        <span className="text-muted">{DateFormatter.format(createdAt)}</span>
      </div>
      <div>
        <span>Обновлено: </span>
        <span className="text-muted">{DateFormatter.format(updatedAt)}</span>
      </div>
    </div>
  )
}

export default About
