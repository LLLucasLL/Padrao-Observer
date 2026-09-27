class InfobipSmsProvider {
  async enviar(message) {
    if (process.env.NODE_ENV === 'test' || !process.env.INFOBIP_API_KEY || !process.env.INFOBIP_SMS_SENDER) {
      return { skipped: true, channel: 'sms', reason: 'infobip_not_configured' };
    }
    const destination = String(message.to || '').replace(/[\s()+-]/g, '');
    if (!/^\d{8,15}$/.test(destination)) {
      throw new Error('INFOBIP_SMS_TO deve conter um numero em formato internacional, por exemplo 5512996637203');
    }
    const baseUrl = process.env.INFOBIP_BASE_URL.replace(/\/$/, '').replace(/^https?:\/\//, '');
    const response = await fetch(`https://${baseUrl}/sms/2/text/advanced`, {
      method: 'POST',
      headers: { Authorization: `App ${process.env.INFOBIP_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ from: process.env.INFOBIP_SMS_SENDER, destinations: [{ to: destination }], text: message.text }] })
    });
    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Infobip retornou ${response.status}: ${details.slice(0, 240)}`);
    }
    const result = await response.json();
    const submission = result.messages?.[0];
    const status = submission?.status;
    console.log(`SMS aceito pela Infobip para ${submission?.to || submission?.destination || 'destinatario'}: ${status?.description || 'aguardando entrega'} (grupo: ${status?.groupName || 'indisponivel'}, codigo: ${status?.id || 'indisponivel'}, messageId: ${submission?.messageId || 'indisponivel'}, bulkId: ${result.bulkId || 'indisponivel'})`);
    return {
      sent: true,
      channel: 'sms',
      destination,
      messageId: submission?.messageId,
      bulkId: result.bulkId,
      status: status?.groupName || status?.name || 'PENDING',
      statusCode: status?.id,
      statusDescription: status?.description
    };
  }
}

module.exports = InfobipSmsProvider;