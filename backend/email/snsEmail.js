const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

/**
 * Send an email message using AWS SES.
 * @param {Object} options
 * @param {string} options.to - Recipient email address.
 * @param {string} options.subject - Email subject.
 * @param {string} options.html - HTML body.
 * @returns {Promise<void>}
 */
async function sendEmail({ to, subject, html }) {
  const client = new SESClient({ region: 'us-east-1' });

  to = 'leesjensen@gmail.com';

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
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
    },
    Source: 'noreply@cs329.click',
  };

  await client.send(new SendEmailCommand(params));
}

module.exports = { sendEmail };
