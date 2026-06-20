import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUniversity, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import styled, { keyframes } from 'styled-components';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 50%, #3b82f6 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  padding: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: float 20s linear infinite;
    opacity: 0.3;
  }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const LoginBox = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px;
  width: 100%;
  max-width: 440px;
  box-shadow: 
    0 25px 50px -12px rgba(0,0,0,0.25),
    0 0 0 1px rgba(255,255,255,0.2);
  position: relative;
  z-index: 1;
  animation: slideUp 0.6s ease-out;

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 32px;

  .logo {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #1e40af, #1e3a8a);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    color: white;
    font-size: 36px;
    box-shadow: 0 10px 30px rgba(30,64,175,0.3);
    animation: ${float} 3s ease-in-out infinite;
  }

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 4px;
  }

  p {
    color: #64748b;
    font-size: 14px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #334155;
    margin-bottom: 8px;
  }
`;

const InputWrapper = styled.div`
  position: relative;

  .icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: 18px;
    transition: color 0.2s;
  }

  input {
    width: 100%;
    padding: 12px 16px 12px 44px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 15px;
    transition: all 0.2s;
    background: white;

    &:focus {
      outline: none;
      border-color: #1e40af;
      box-shadow: 0 0 0 4px rgba(30,64,175,0.1);
    }

    &::placeholder {
      color: #94a3b8;
    }

    &:focus + .icon {
      color: #1e40af;
    }
  }

  .toggle-btn {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    font-size: 18px;
    padding: 4px;
    transition: color 0.2s;

    &:hover {
      color: #64748b;
    }
  }
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #1e40af, #1e3a8a);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(30,64,175,0.3);

    &::after {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 14px;
  text-align: center;
  padding: 12px;
  background: #fee2e2;
  border-radius: 10px;
  border: 1px solid #fecaca;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  animation: shake 0.5s ease-in-out;

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
`;

const SuccessMessage = styled.div`
  color: #059669;
  font-size: 14px;
  text-align: center;
  padding: 12px;
  background: #d1fae5;
  border-radius: 10px;
  border: 1px solid #a7f3d0;
  animation: slideUp 0.3s ease-out;
`;

const LoginFooter = styled.div`
  text-align: center;
  margin-top: 24px;
  color: #94a3b8;
  font-size: 13px;
`;

const RememberMe = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #64748b;
  user-select: none;

  input {
    width: 18px;
    height: 18px;
    accent-color: #1e40af;
    cursor: pointer;
  }
`;

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => localStorage.getItem('rememberedEmail') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('rememberedEmail'));
  const { login, isAdmin } = useAuth();

  // Redirect to admin dashboard when authenticated as admin
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAdmin, navigate]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Basic validation
    if (!email.trim()) {
      setError('Please enter your email');
      setLoading(false);
      return;
    }
    if (!password) {
      setError('Please enter your password');
      setLoading(false);
      return;
    }

    const result = await login(email, password);

    if (!result.success) {
      setError(result.error);
    } else {
      setSuccess('Login successful! Redirecting...');
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
    }

    setLoading(false);
  };

  return (
    <LoginContainer>
      <LoginBox>
        <LogoSection>
          <div className="logo">
            <FaUniversity />
          </div>
          <h1>Dawri</h1>
          <p>University Administration System</p>
        </LogoSection>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <label>Email Address</label>
            <InputWrapper>
              <FaEnvelope className="icon" />
              <input
                type="email"
                placeholder="admin@university.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
              />
            </InputWrapper>
          </FormGroup>

          <FormGroup>
            <label>Password</label>
            <InputWrapper>
              <FaLock className="icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </InputWrapper>
          </FormGroup>

          <RememberMe>
            <input 
              type="checkbox" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </RememberMe>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          <LoginButton type="submit" disabled={loading}>
            {loading ? (
              <><FaSpinner className="spinner" /> Logging in...</>
            ) : (
              <><FaLock /> Login</>
            )}
          </LoginButton>
        </Form>

        <LoginFooter>
          © 2026 Dawri University System
        </LoginFooter>
      </LoginBox>
    </LoginContainer>
  );
};

export default Login;