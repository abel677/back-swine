import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { IMessage, MailService } from "../../shared/domain/mail-service.port";
import { envConfig } from "../../../config/envs";

const { MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD } = envConfig;

export class MailtrapService implements MailService {
  private transporter: Mail;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: MAIL_HOST,
      port: MAIL_PORT,
      auth: {
        user: MAIL_USERNAME,
        pass: MAIL_PASSWORD,
      },
    });
  }

  async send(message: IMessage): Promise<void> {
    await this.transporter.sendMail({
      to: {
        name: message.to.name,
        address: message.to.email,
      },
      from: {
        name: message.from.name,
        address: message.from.email,
      },
      subject: message.subject,
      html: message.body,
    });
  }
}
