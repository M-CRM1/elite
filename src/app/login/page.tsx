'use client';
import { useState } from 'react';

const Login = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      // Handle successful login (e.g., save token, redirect)
      console.log('Login successful:', data);
      // Example: localStorage.setItem('token', data.token);
      // Redirect to a protected route or dashboard
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='container' style={{ padding: '20px' }}>
      <h1>При смене пароля логин и пароль приходит на почту админа</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form className='form' onSubmit={handleSubmit}>
        <div>
          <label>Login:</label>
          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
