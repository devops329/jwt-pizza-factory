/**
 * Send an email message.
 * @param {Object} options
 * @param {string} options.to - Recipient email address.
 * @param {string} options.subject - Email subject.
 * @param {string} [options.html] - HTML body (optional).
 * @returns {Promise<void>}
 */
async function sendEmail({ to, subject, html }) {
  throw new Error('sendEmail method not implemented');
}

module.exports = { sendEmail };
