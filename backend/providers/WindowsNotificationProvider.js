class WindowsNotificationProvider {
  async enviar(message) {
    if (process.env.NODE_ENV === 'test') return { skipped: true, channel: 'windows' };
    const notifier = require('node-notifier');
    notifier.notify({ title: message.title, message: message.message });
    return { sent: true, channel: 'windows' };
  }
}

module.exports = WindowsNotificationProvider;