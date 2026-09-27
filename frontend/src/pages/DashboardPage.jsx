import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, clearToken } from '../api';

const statuses = ['CRIADO', 'PROCESSANDO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'];

function Modal({ title, children, onClose }) {
  return <div className="modal"><div className="modal-content"><div className="panel-heading"><h3>{title}</h3><button type="button" className="secondary" onClick={onClose}>Fechar</button></div>{children}</div></div>;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('observer-user') || 'null'));
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [modal, setModal] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [productForm, setProductForm] = useState({ nome: '', preco: '', estoque: 0 });
  const [orderForm, setOrderForm] = useState({ produtoId: '', quantidade: 1, clienteNome: '', clienteEmail: '' });

  async function loadData() {
    const [loadedProducts, loadedOrders] = await Promise.all([api('/api/produtos'), api('/api/pedidos')]);
    setProducts(loadedProducts);
    setOrders(loadedOrders);
    if (!orderForm.produtoId && loadedProducts[0]) setOrderForm((current) => ({ ...current, produtoId: String(loadedProducts[0].id) }));
  }

  useEffect(() => { loadData().catch((loadError) => setError(loadError.message)); }, []);

  function logout() { clearToken(); localStorage.removeItem('observer-user'); navigate('/login', { replace: true }); }
  async function saveProduct(event) {
    event.preventDefault();
    try { await api(productForm.id ? `/api/produtos/${productForm.id}` : '/api/produtos', { method: productForm.id ? 'PUT' : 'POST', body: JSON.stringify({ ...productForm, preco: Number(productForm.preco), estoque: Number(productForm.estoque) }) }); setModal(null); setProductForm({ nome: '', preco: '', estoque: 0 }); setFeedback(productForm.id ? 'Produto atualizado' : 'Produto criado'); await loadData(); } catch (submitError) { setError(submitError.message); }
  }
  async function createOrder(event) {
    event.preventDefault();
    try { await api('/api/pedidos', { method: 'POST', body: JSON.stringify({ ...orderForm, produtoId: Number(orderForm.produtoId), quantidade: Number(orderForm.quantidade) }) }); setModal(null); setOrderForm({ produtoId: products[0] ? String(products[0].id) : '', quantidade: 1, clienteNome: '', clienteEmail: '' }); setFeedback('Pedido criado'); await loadData(); } catch (submitError) { setError(submitError.message); }
  }
  async function removeProduct(id) { try { await api(`/api/produtos/${id}`, { method: 'DELETE' }); setFeedback('Produto excluido'); await loadData(); } catch (submitError) { setError(submitError.message); } }
  async function changeStatus(id, status) { try { await api(`/api/pedidos/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); setFeedback('Status alterado e observadores notificados'); await loadData(); } catch (submitError) { setError(submitError.message); } }

  return <main id="app"><header className="topbar"><div><p className="eyebrow">PAINEL DE OPERACOES</p><h2>Pedidos</h2></div><div className="topbar-actions"><span id="user-role">{user?.papel || 'SESSAO ATIVA'}</span><button className="secondary" onClick={logout}>Sair</button></div></header>
    {error && <p className="error page-error">{error}</p>}
    <div className="content-grid"><section className="panel"><div className="panel-heading"><h3>Produtos</h3>{user?.papel === 'DONO' && <button onClick={() => { setProductForm({ nome: '', preco: '', estoque: 0 }); setModal('product'); }}>Novo produto</button>}</div>{products.map((product) => <div className="item" key={product.id}><div><strong>{product.nome}</strong><small>{product.descricao || 'Sem descricao'} | R$ {Number(product.preco).toFixed(2)} | estoque {product.estoque}</small></div>{user?.papel === 'DONO' && <div className="item-actions"><button className="secondary" onClick={() => { setProductForm({ ...product }); setModal('product'); }}>Editar</button><button className="secondary" onClick={() => removeProduct(product.id)}>Excluir</button></div>}</div>)}{!products.length && <p>Nenhum produto cadastrado.</p>}</section>
    <section className="panel"><div className="panel-heading"><h3>Pedidos</h3><button onClick={() => setModal('order')} disabled={!products.length}>Novo pedido</button></div>{orders.map((order) => <div className="item" key={order.id}><div><strong>#{order.id} {order.clienteNome}</strong><small>Produto {order.produtoId} | quantidade {order.quantidade || 1}</small></div><select id={`order-status-${order.id}`} name={`status-${order.id}`} aria-label={`Status do pedido ${order.id}`} value={order.status} onChange={(event) => changeStatus(order.id, event.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></div>)}{!orders.length && <p>Nenhum pedido cadastrado.</p>}</section></div>
    {feedback && <p className="feedback">{feedback}</p>}
    {modal === 'product' && <Modal title={productForm.id ? 'Editar produto' : 'Novo produto'} onClose={() => setModal(null)}><form onSubmit={saveProduct}><label htmlFor="product-name">Nome<input id="product-name" name="nome" value={productForm.nome} onChange={(event) => setProductForm({ ...productForm, nome: event.target.value })} required /></label><label htmlFor="product-description">Descricao<input id="product-description" name="descricao" value={productForm.descricao || ''} onChange={(event) => setProductForm({ ...productForm, descricao: event.target.value })} /></label><label htmlFor="product-price">Preco<input id="product-price" name="preco" type="number" min="0" step="0.01" value={productForm.preco} onChange={(event) => setProductForm({ ...productForm, preco: event.target.value })} required /></label><label htmlFor="product-stock">Estoque inicial<input id="product-stock" name="estoque" type="number" min="0" value={productForm.estoque} onChange={(event) => setProductForm({ ...productForm, estoque: event.target.value })} required /></label><button type="submit">{productForm.id ? 'Salvar alteracoes' : 'Cadastrar produto'}</button></form></Modal>}
    {modal === 'order' && <Modal title="Novo pedido" onClose={() => setModal(null)}><form onSubmit={createOrder}><label>Produto<select id="order-product" name="produtoId" value={orderForm.produtoId} onChange={(event) => setOrderForm({ ...orderForm, produtoId: event.target.value })} required>{products.map((product) => <option value={product.id} key={product.id}>{product.nome}</option>)}</select></label><label>Quantidade<input id="order-quantity" name="quantidade" type="number" min="1" step="1" value={orderForm.quantidade} onChange={(event) => setOrderForm({ ...orderForm, quantidade: event.target.value })} required /></label><label>Nome do cliente<input id="customer-name" name="clienteNome" value={orderForm.clienteNome} onChange={(event) => setOrderForm({ ...orderForm, clienteNome: event.target.value })} required /></label><label>E-mail do cliente<input id="customer-email" name="clienteEmail" type="email" value={orderForm.clienteEmail} onChange={(event) => setOrderForm({ ...orderForm, clienteEmail: event.target.value })} required /></label><button type="submit">Cadastrar pedido</button></form></Modal>}
  </main>;
}
