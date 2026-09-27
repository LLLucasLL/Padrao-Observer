class EmailGoogleProvider {
  async enviar(message) {
    if (process.env.NODE_ENV === 'test' || !process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
      return { skipped: true, channel: 'email' };
    }

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: process.env.EMAIL_SECURE === 'true',
      tls: {
        rejectUnauthorized: process.env.EMAIL_TLS_REJECT_UNAUTHORIZED !== 'false'
      },
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    await transporter.verify();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: message.to,
      subject: message.subject,
      text: message.text
    });
    return { sent: true, channel: 'email' };
  }
}

module.exports = EmailGoogleProvider;