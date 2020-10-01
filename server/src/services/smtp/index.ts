import {createTransport} from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import logger from '../logger'

// Конфиг на подключение smtp сервера
const config = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
}

// Класс для отправки email
export class Smtp {
    private transport: Mail

    constructor() {
        // @ts-ignore
        this.transport = createTransport(config)
    }

    // Отправка подтверждения регистрации
    public sendConfirmation = (email: string, nickname: string, token: string) => {
        const mailOptions = {
            from: `Equilibrium: RP сервере WOW robot <${config.auth.user}>`,
            to: email,
            subject: 'Подтверждение аккаунта на сайте Equilibrium: RP сервере WOW',
            html: this.htmlConfirmation(nickname, token)
        }
        return this.transport.sendMail(mailOptions).then(() => {
            return Promise.resolve()
        }, err => {
            logger.error(err)
            return Promise.reject()
        })
    }

    // Формирование html подтверждения регистрации
    private htmlConfirmation = (nickname: string, token: string) => {
        // @ts-ignore
        const link = `http://${process.env.HOST}${(process.env.PORT !== 80?':'+process.env.PORT: '')}/login?token=${token}`
        return `<p>Здравствуйте, ${nickname}</p>
            <p>Перейдите по следующей ссылке для активации аккаунта:</p>
            <p><a href="${link}">${link}</a></p>`
    }
}

export default () => new Smtp()