document.addEventListener('DOMContentLoaded', () => {
  // Check if already logged in
  checkAuth();
  
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      // Simple validation
      if (!email || !password) {
        loginError.textContent = 'Please enter both email and password';
        return;
      }
      
      // For demo purposes, accept any email/password
      // In a real app, you would validate against a server
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userName', email.split('@')[0]);
      
      // Redirect to dashboard
      window.location.href = 'index.html';
    });
  }
});