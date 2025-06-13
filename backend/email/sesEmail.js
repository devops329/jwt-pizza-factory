const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

/**
 * Send an email message using AWS SES.
 * @param {Object} options
 * @param {string} options.to - Recipient email address.
 * @param {string} options.subject - Email subject.
 * @param {string} options.html - HTML body.
 * @returns {Promise<void>}
 */
async function sendEmail({ to, subject, html, text }) {
  const client = new SESClient({ region: 'us-east-1' });

  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: html,
        },
        Text: {
          Charset: 'UTF-8',
          Data: text,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
    },
    Source: '"CS 329" <no-reply@cs329.click>',
  };

  await client.send(new SendEmailCommand(params));
}

module.exports = { sendEmail };
