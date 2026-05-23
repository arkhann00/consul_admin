import { request } from './client';

export function listDoctors(skip = 0, limit = 100) {
  return request(`/doctors?skip=${skip}&limit=${limit}`, { auth: false });
}

export function getDoctor(id) {
  return request(`/doctors/${id}`, { auth: false });
}

export function createDoctorMultipart(formData) {
  return request('/doctors', {
    method: 'POST',
    body: formData,
  });
}

export function createDoctorJson(data) {
  return request('/doctors/json', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateDoctorMultipart(id, formData) {
  return request(`/doctors/${id}`, {
    method: 'PUT',
    body: formData,
  });
}

export function updateDoctorJson(id, data) {
  return request(`/doctors/${id}/json`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteDoctor(id) {
  return request(`/doctors/${id}`, { method: 'DELETE' });
}

export function doctorFullName(doctor) {
  const parts = [doctor.last_name, doctor.first_name, doctor.patronymic].filter(Boolean);
  return parts.join(' ');
}
