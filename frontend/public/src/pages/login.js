import { api } from '../modules/api.js';
import { setToken, setRole } from '../modules/auth.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.style.display = 'none';

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await api.login(username, password);
        if (response && response.token) {
            setToken(response.token);
            setRole(response.role);
            window.location.href = '/dashboard.html';
        }
    } catch (error) {
        errorDiv.textContent = error.message || 'Login failed';
        errorDiv.style.display = 'block';
    }
});
