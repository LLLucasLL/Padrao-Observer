class BaileysWhatsAppProvider {
  constructor() {
    this.socket = null;
    this.ready = false;
    this.initialized = false;
    this.reconnectTimer = null;
  }

  async initialize() {
    if (this.initialized || process.env.NODE_ENV === 'test' || !process.env.WHATSAPP_NUMBER) return;
    this.initialized = true;

    const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = await import('@whiskeysockets/baileys');
    const qrcode = require('qrcode-terminal');
    const logger = require('pino')({ level: 'silent' });
    const { state, saveCreds } = await useMultiFileAuthState(process.env.WHATSAPP_AUTH_DIR || '.baileys-auth');

    this.socket = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ['Laboratory Observer', 'Chrome', '1.0.0'],
      logger
    });

    this.socket.ev.on('creds.update', saveCreds);
    this.socket.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
      if (qr) {
        console.log('\nEscaneie este QR Code no WhatsApp > Dispositivos conectados:\n');
        qrcode.generate(qr, { small: true });
      }

      if (connection === 'open') {
        this.ready = true;
        console.log('WhatsApp conectado.');
      }

      if (connection === 'close') {
        this.ready = false;
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        if (statusCode === DisconnectReason.loggedOut) {
          this.socket = null;
          this.initialized = false;
          console.error('WhatsApp desconectado. Remova a pasta de autenticacao e conecte novamente.');
        } else {
          this.socket = null;
          this.initialized = false;
          console.error(`Conexao do WhatsApp encerrada (${statusCode || 'codigo desconhecido'}). Tentando reconectar...`);
          if (!this.reconnectTimer) {
            this.reconnectTimer = setTimeout(() => {
              this.reconnectTimer = null;
              this.initialize().catch((error) => console.error('Falha ao reconectar WhatsApp:', error.message));
            }, 1000);
          }
        }
      }
    });
  }

  async enviar(message) {
    if (process.env.NODE_ENV === 'test' || !process.env.WHATSAPP_NUMBER) return { skipped: true, channel: 'whatsapp' };
    if (!this.ready || !this.socket) return { skipped: true, channel: 'whatsapp', reason: 'whatsapp_session_not_ready' };

    try {
      await this.socket.sendMessage(`${process.env.WHATSAPP_NUMBER}@s.whatsapp.net`, { text: message.text });
      return { sent: true, channel: 'whatsapp' };
    } catch (error) {
      console.error('Falha ao enviar WhatsApp:', error.message);
      return { skipped: true, channel: 'whatsapp', reason: 'send_failed' };
    }
  }
}

module.exports = BaileysWhatsAppProvider;