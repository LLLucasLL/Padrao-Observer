# Exemplo didatico do Observer

Este exemplo corresponde ao laboratorio de Observer e fica separado da aplicacao web.

Executar:

```text
node examples/observer/Main.js
```

`Pedido` e o Subject concreto. `EmailObserver`, `SMSObserver`, `LogObserver` e `WhatsAppObserver` sao observadores concretos. O `Main.js` demonstra cadastro, remocao e dois pedidos com conjuntos diferentes de observadores.
