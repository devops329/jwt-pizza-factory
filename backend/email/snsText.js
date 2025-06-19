const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const snsClient = new SNSClient({ region: 'us-east-1' });

async function sendText(phoneNumber, message) {
  const params = {
    Message: message,
    PhoneNumber: phoneNumber,
  };

  try {
    const data = await snsClient.send(new PublishCommand(params));
    return { message: 'Message sent successfully:', id: data.MessageId };
  } catch (err) {
    return { message: `Error sending message: ${err}` };
  }
}

module.exports = { sendText };
