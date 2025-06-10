/**
 * Send an email message using AWS SNS.
 * @param {Object} options
 * @param {string} options.to - Recipient email address.
 * @param {string} options.subject - Email subject.
 * @param {string} options.html - HTML body.
 * @returns {Promise<void>}
 */
async function sendEmail({ to, subject, html }) {
  throw new Error('sendEmail method not implemented');
}

module.exports = { sendEmail };
