import React from 'react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api, saveToken } from '../api';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [error, setError] = useState(location.state?.message || '');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      const result = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(form) });
      saveToken(result.token);
      localStorage.setItem('observer-user', JSON.stringify(result.user));
      navigate('/dashboard', { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return <main className="auth-shell"><section className="login-panel">
    <p className="eyebrow">LABORATORY OBSERVER</p>
    <h1>Pedidos que avisam<br />quando mudam.</h1>
    <form onSubmit={handleSubmit}>
      <label htmlFor="login-email">E-mail<input id="login-email" name="email" type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
      <label htmlFor="login-password">Senha<input id="login-password" name="senha" type="password" autoComplete="current-password" value={form.senha} onChange={(event) => setForm({ ...form, senha: event.target.value })} required /></label>
      <button type="submit">Entrar</button>
      <p className="error">{error}</p>
    </form>
    <Link className="link-button" to="/cadastro">Criar uma conta</Link>
  </section></main>;
}
