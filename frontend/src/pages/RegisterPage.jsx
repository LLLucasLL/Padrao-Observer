import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', email: '', senha: '', papel: 'FUNCIONARIO' });
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      await api('/api/auth/register', { method: 'POST', body: JSON.stringify(form) });
      navigate('/login', { replace: true, state: { message: 'Cadastro realizado. Faca login para continuar.' } });
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return <main className="auth-shell"><section className="login-panel">
    <p className="eyebrow">NOVO ACESSO</p>
    <h1>Crie seu<br />usuario.</h1>
    <form onSubmit={handleSubmit}>
      <label htmlFor="register-name">Nome<input id="register-name" name="nome" autoComplete="name" value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} required /></label>
      <label htmlFor="register-email">E-mail<input id="register-email" name="email" type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
      <label htmlFor="register-password">Senha<input id="register-password" name="senha" type="password" autoComplete="new-password" minLength="6" value={form.senha} onChange={(event) => setForm({ ...form, senha: event.target.value })} required /></label>
      <fieldset className="role-options"><legend>Tipo de acesso</legend><label htmlFor="register-owner"><input id="register-owner" name="papelDono" type="checkbox" checked={form.papel === 'DONO'} onChange={(event) => setForm({ ...form, papel: event.target.checked ? 'DONO' : 'FUNCIONARIO' })} /> Cadastrar como dono</label><small>Desmarcado: Funcionário</small></fieldset>
      <button type="submit">Cadastrar</button>
      <p className="error">{error}</p>
    </form>
    <Link className="link-button" to="/login">Voltar para o login</Link>
  </section></main>;
}
