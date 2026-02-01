// Authentication module
const API_BASE = window.location.origin;

export function getToken() {
    return localStorage.getItem('authToken');
}

export function setToken(token) {
    localStorage.setItem('authToken', token);
}

export function removeToken() {
    localStorage.removeItem('authToken');
}

export function getRole() {
    return localStorage.getItem('userRole');
}

export function setRole(role) {
    localStorage.setItem('userRole', role);
}

export function removeRole() {
    localStorage.removeItem('userRole');
}

export function isAuthenticated() {
    return !!getToken();
}

export function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/index.html';
        return false;
    }
    return true;
}

export function logout() {
    removeToken();
    removeRole();
    window.location.href = '/index.html';
}
