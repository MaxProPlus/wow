import React from 'react'
import {Col, Row} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import styles from './Block.module.scss'
import iconDs from './img/ds.svg'
import iconMail from './img/mail.svg'
import iconVk from './img/vk.svg'
import iconTg from './img/tg.svg'
import defaultAvatar from 'img/default.png'

type P = {
  idUser: number
  urlAvatar: string
  nickname: string
  role: string
  linkDs: string
  linkMail: string
  linkVk: string
  linkTg: string
}

const Block = ({
  idUser,
  urlAvatar,
  nickname,
  role,
  linkDs,
  linkMail,
  linkVk,
  linkTg,
}: P | any) => {
  return (
    <Row className={styles.block}>
      <Col md={2}>
        <Link to={'/profile/' + idUser}>
          <img src={urlAvatar || defaultAvatar} alt="" />
        </Link>
      </Col>
      <Col md={6}>
        <Link to={'/profile/' + idUser}>
          <div className={styles.nickname}>{nickname}</div>
        </Link>
        <div className={styles.role}>{role}</div>
      </Col>
      <Col md={4} className={styles.blockLink}>
        {linkDs && (
          <div className={`${styles.link} ${styles.ds}`}>
            <img src={iconDs} alt="" />
            {linkDs}
          </div>
        )}
        {linkMail && (
          <a
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.link} ${styles.mail}`}
            href={`mailto:${linkMail}`}
          >
            <img src={iconMail} alt="" /> Написать на почту
          </a>
        )}
        {linkVk && (
          <a
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.link} ${styles.vk}`}
            href={`https://vk.com/${linkVk}`}
          >
            <img src={iconVk} alt="" /> Написать в VK{' '}
          </a>
        )}
        {linkTg && (
          <a
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.link} ${styles.tg}`}
            href={`https://t.me/${linkTg}`}
          >
            <img src={iconTg} alt="" /> Написать в TG{' '}
          </a>
        )}
      </Col>
    </Row>
  )
}
export default Block
