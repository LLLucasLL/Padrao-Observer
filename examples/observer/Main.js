const Pedido = require('./Pedido');
const EmailObserver = require('./EmailObserver');
const SMSObserver = require('./SMSObserver');
const LogObserver = require('./LogObserver');
const WhatsAppObserver = require('./WhatsAppObserver');

const pedido = new Pedido();
const emailObserver = new EmailObserver();
const smsObserver = new SMSObserver();

pedido.adicionarObserver(emailObserver);
pedido.adicionarObserver(smsObserver);
pedido.adicionarObserver(new LogObserver());
pedido.adicionarObserver(new WhatsAppObserver());
pedido.mudarStatus('Pedido enviado');

pedido.removerObserver(smsObserver);
pedido.mudarStatus('Pedido entregue');

const segundoPedido = new Pedido();
segundoPedido.adicionarObserver(new EmailObserver());
segundoPedido.adicionarObserver(new LogObserver());
segundoPedido.mudarStatus('Pedido processando');
