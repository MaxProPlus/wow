import {createTransport, SentMessageInfo} from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import {ApiError} from '../../errors'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import ConfigProvider from '../config'
import {logger} from '../../modules/core'

// Ошибка отправки по email
export class SmtpError extends ApiError {
    constructor() {
        super('Ошибка при отправке сообщения. Если ошибка повторится, то свяжитесь с администрацией', 'ERROR_SMTP')
    }
}

// Класс для отправки email
export class Smtp {
    private transport: Mail

    constructor(private configProvider: ConfigProvider) {
        this.transport = createTransport(configProvider.get<SMTPTransport.Options>('smtp'))
    }

    // Отправка подтверждения регистрации
    public sendConfirmation = (email: string, nickname: string, token: string): Promise<SentMessageInfo> => {
        const mailOptions = {
            from: `Equilibrium: RP сервере WOW robot <${this.configProvider.get('smtp.auth.user')}>`,
            to: email,
            subject: 'Подтверждение аккаунта на сайте Equilibrium: RP сервере WOW',
            html: this.htmlConfirmation(nickname, token)
        }
        return this.transport.sendMail(mailOptions).catch((err: Error) => {
            logger.error(err)
            throw new SmtpError()
        })
    }

    // Формирование html подтверждения регистрации
    private htmlConfirmation = (nickname: string, token: string): string => {
        const link = `http://${this.configProvider.get('host')}${(this.configProvider.get('port') !== 80?':'+this.configProvider.get('port'): '')}/login?token=${token}`
        return `<p>Здравствуйте, ${nickname}</p>
            <p>Перейдите по следующей ссылке для активации аккаунта:</p>
            <p><a href="${link}">${link}</a></p>`
    }

    // Отправка потверждения изменения email
    public sendChangeEmail = (email: string, token: string): Promise<SentMessageInfo> => {
        const mailOptions = {
            from: `Equilibrium: RP сервере WOW robot <${this.configProvider.get('smtp.auth.user')}>`,
            to: email,
            subject: 'Подтверждение смена email на сайте Equilibrium: RP сервере WOW',
            html: this.htmlChangeEmail(token)
        }
        return this.transport.sendMail(mailOptions).catch(err => {
            logger.error(err)
            throw new SmtpError()
        })
    }

    // Формирование html потверждения изменения email
    private htmlChangeEmail = (token: string) => {
        const link = `http://${this.configProvider.get('host')}${(this.configProvider.get('port') !== 80?':'+this.configProvider.get('port'): '')}/setting?token=${token}`
        return `<p>Здравствуйте</p>
            <p>Перейдите по следующей ссылке для смены email: </p>
            <p><a href="${link}">${link}</a></p>`
    }
}

export default Smtp