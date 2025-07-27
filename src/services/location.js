// src/services/location.js
import { BASE_URL } from "./auth";

// Lấy danh sách quận/huyện
export async function fetchDistricts() {
  const res = await fetch(`${BASE_URL}/Location/districts`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
}

// Lấy danh sách phường/xã theo quận/huyện
export async function fetchWards(districtId) {
  const res = await fetch(`${BASE_URL}/Location/wards?districtId=${districtId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
}
