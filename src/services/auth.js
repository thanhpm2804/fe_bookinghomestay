// import { useNavigate } from "react-router-dom";


export const BASE_URL = "https://localhost:7220/api";

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/Account/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function register(data) {
  const res = await fetch(`${BASE_URL}/Account/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function forgotPassword(email) {
  const res = await fetch(`${BASE_URL}/Account/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function resetPasswordWithCode(email, code, newPassword) {
  const res = await fetch(`${BASE_URL}/Account/reset-password-with-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code, newPassword }),
  });
  return res.json();
}

// Hàm gọi API chung
export async function apiFetch(basePath, endpoint, options = {}) {
  const url = `${BASE_URL}/${basePath}/${endpoint}`;
  return fetch(url, options);
}
