import React, { useState } from 'react';

function Register() {
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Gọi API đăng ký
    alert(JSON.stringify(form));
  };
  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 24 }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </div>
        <div>
          <label>First Name</label>
          <input name="firstName" value={form.firstName} onChange={handleChange} required />
        </div>
        <div>
          <label>Last Name</label>
          <input name="lastName" value={form.lastName} onChange={handleChange} required />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
export default Register; 