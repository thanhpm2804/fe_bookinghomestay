// import { useNavigate } from "react-router-dom";
import * as jwt_decode from "jwt-decode";


export const BASE_URL = "https://localhost:7220/api";

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/Account/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (res.ok) {
    const decoded = jwt_decode(data.token); // Giải mã token

    // Lưu vào localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("expiration", data.expiration);
    localStorage.setItem("email", decoded.email);
    localStorage.setItem("unique_name", decoded.unique_name); // hoặc nameid nếu bạn cần ID
    console.log(data.token);
  }

  return data;
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


export const createOwnerAccount = async (ownerData) =>{
    try {
            const url = `${BASE_URL}/Account/create-owner-account`;
            const newOwnerData = {
                firstName: ownerData.firstName,
                lastName: ownerData.lastName,
                gender: parseInt(ownerData.gender),
                dateOfBirth: ownerData.dateOfBirth,
                email: ownerData.email,
                phoneNumber: ownerData.phoneNumber,
                address: ownerData.address,
                avatarUrl: ownerData.avatarUrl,
            }
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newOwnerData)
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                return { error: errorData.error || `HTTP error! Status: ${response.status}` };
            }
    
            const data = await response.json();
            return data;
    
        } catch (error) {
            console.log(error);
            return { error: "An unexpected error occurred" };
        }
}