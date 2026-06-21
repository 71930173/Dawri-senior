import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUserTie, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(30,64,175,0.1) 0%, transparent 70%);
    top: -50%;
    left: -50%;
    animation: pulse 15s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;

const LoginBox = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 48px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1);
  animation: ${fadeIn} 0.6s ease-out;
  position: relative;
  z-index: 1;

  @media (max-width: 480px) {
    padding: 32px 24px;
    border-radius: 20px;
  }
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 32px;

  .logo {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #1e40af, #1d4ed8);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    color: white;
    font-size: 36px;
    box-shadow: 0 10px 25px -5px rgba(30,64,175,0.4);
    transition: transform 0.3s;

    &:hover {
      transform: scale(1.05) rotate(5deg);
    }
  }

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }

  p {
    color: #475569;
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
    font-weight: 600;
    color: #334155;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
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
    padding: 14px 16px 14px 46px;
    border: 2px solid #e2e8f0;
    border-radius: 14px;
    font-size: 15px;
    transition: all 0.2s;
    background: #f8fafc;

    &:focus {
      outline: none;
      border-color: #1e40af;
      background: white;
      box-shadow: 0 0 0 4px rgba(30,64,175,0.1);

      & + .icon, & ~ .icon {
        color: #1e40af;
      }
    }

    &::placeholder {
      color: #94a3b8;
    }

    &.error {
      border-color: #ef4444;
      background: #fef2f2;
      animation: ${shake} 0.5s ease-in-out;

      &:focus {
        box-shadow: 0 0 0 4px rgba(239,68,68,0.1);
      }
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

const OptionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;

  .remember {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #475569;
    cursor: pointer;
    user-select: none;

    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: #1e40af;
      cursor: pointer;
    }
  }

  .forgot {
    color: #1e40af;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;

    &:hover {
      color: #1d4ed8;
      text-decoration: underline;
    }
  }
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #1e40af, #1d4ed8);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
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
    box-shadow: 0 10px 25px -5px rgba(30,64,175,0.4);

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
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #dc2626;
  font-size: 14px;
  text-align: left;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  animation: ${fadeIn} 0.3s ease-out;

  svg {
    flex-shrink: 0;
  }
`;

const LoginFooter = styled.div`
  text-align: center;
  margin-top: 24px;
  color: #94a3b8;
  font-size: 13px;

  .links {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 8px;

    a {
      color: #64748b;
      text-decoration: none;
      transition: color 0.2s;

      &:hover {
        color: #1e40af;
      }
    }
  }
`;

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { login, isStaff } = useAuth();

  // Load remembered email
  useEffect(() => {
    const remembered = localStorage.getItem('rememberedEmail');
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Redirect to staff dashboard when authenticated as staff
  useEffect(() => {
    if (isStaff) {
      navigate('/staff/dashboard', { replace: true });
    }
  }, [isStaff, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await login(email, password, rememberMe);

      if (!result.success) {
        setError(result.error);
        if (result.status === 429) {
          setError('Too many attempts. Please wait a few minutes.');
        }
      } else {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginBox>
        <LogoSection>
          <div className="logo">
            <FaUserTie />
          </div>
          <h1>Dawri</h1>
          <p>Staff Portal - University Queue Management</p>
        </LogoSection>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <label>
              <FaEnvelope size={14} />
              Email Address
            </label>
            <InputWrapper>
              <FaEnvelope className="icon" />
              <input
                type="email"
                placeholder="staff@university.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors(prev => ({ ...prev, email: '' }));
                }}
                className={fieldErrors.email ? 'error' : ''}
                disabled={loading}
                autoComplete="email"
              />
            </InputWrapper>
            {fieldErrors.email && (
              <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                {fieldErrors.email}
              </div>
            )}
          </FormGroup>

          <FormGroup>
            <label>
              <FaLock size={14} />
              Password
            </label>
            <InputWrapper>
              <FaLock className="icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors(prev => ({ ...prev, password: '' }));
                }}
                className={fieldErrors.password ? 'error' : ''}
                disabled={loading}
                autoComplete="current-password"
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
            {fieldErrors.password && (
              <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                {fieldErrors.password}
              </div>
            )}
          </FormGroup>

          <OptionsRow>
            <label className="remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              Remember me
            </label>
            <a href="#forgot" className="forgot" onClick={(e) => { e.preventDefault(); alert('Contact admin to reset password'); }}>
              Forgot password?
            </a>
          </OptionsRow>

          {error && (
            <ErrorMessage>
              <FaExclamationTriangle />
              {error}
            </ErrorMessage>
          )}

          <LoginButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <FaSpinner className="spinner" />
                Signing in...
              </>
            ) : (
              <>
                <FaLock />
                Sign In
              </>
            )}
          </LoginButton>
        </Form>

        <LoginFooter>
          <p>© 2026 Dawri University System</p>
          <div className="links">
            <a href="#help">Help</a>
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
          </div>
        </LoginFooter>
      </LoginBox>
    </LoginContainer>
  );
};

export default Login;