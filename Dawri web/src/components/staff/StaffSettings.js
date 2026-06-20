import React, { useState, useEffect, useCallback } from 'react';
import { staffAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FaUserTie, FaEnvelope, FaMapMarkerAlt, FaBuilding, 
  FaLayerGroup, FaCheckCircle, FaPause, FaExclamationTriangle,
  FaSave, FaLock, FaEye, FaEyeSlash, FaSpinner,
  FaShieldAlt, FaCog
} from 'react-icons/fa';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageHeader = styled.div`
  margin-bottom: 24px;

  h2 {
    font-size: 22px;
    font-weight: 700;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  p {
    color: #64748b;
    font-size: 14px;
    margin-top: 4px;
  }
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  animation: ${fadeIn} 0.5s ease-out;

  .card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid #f1f5f9;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    svg {
      font-size: 20px;
      color: #1e40af;  /* CHANGED: from #2563eb to #1e40af */
    }
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;

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

  input {
    width: 100%;
    padding: 12px 14px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 14px;
    color: #334155;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: #1e40af;  /* CHANGED: from #2563eb to #1e40af */
      box-shadow: 0 0 0 4px rgba(30,64,175,0.1);  /* CHANGED: rgba values */
    }

    &:disabled {
      background: #f1f5f9;
      cursor: not-allowed;
      color: #94a3b8;
    }

    &::placeholder {
      color: #94a3b8;
    }

    &.error {
      border-color: #ef4444;
      background: #fef2f2;

      &:focus {
        box-shadow: 0 0 0 4px rgba(239,68,68,0.1);
      }
    }
  }

  .hint {
    font-size: 12px;
    color: #94a3b8;
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .error-msg {
    font-size: 12px;
    color: #ef4444;
    margin-top: 4px;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const PasswordInputWrapper = styled.div`
  position: relative;

  input {
    padding-right: 44px;
  }

  .toggle-btn {
    position: absolute;
    right: 12px;
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

const StatusToggle = styled.div`
  display: flex;
  gap: 10px;

  @media (max-width: 480px) {
    flex-direction: column;
  }

  button {
    flex: 1;
    padding: 14px 20px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
    border: 2px solid;
    position: relative;
    overflow: hidden;

    &.available {
      background: ${props => props.status === 'available' ? '#10b981' : 'white'};
      border-color: #10b981;
      color: ${props => props.status === 'available' ? 'white' : '#10b981'};

      &:hover {
        background: #10b981;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(16,185,129,0.3);
      }
    }

    &.paused {
      background: ${props => props.status === 'paused' ? '#f59e0b' : 'white'};
      border-color: #f59e0b;
      color: ${props => props.status === 'paused' ? 'white' : '#f59e0b'};

      &:hover {
        background: #f59e0b;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(245,158,11,0.3);
      }
    }

    &.unavailable {
      background: ${props => props.status === 'unavailable' ? '#ef4444' : 'white'};
      border-color: #ef4444;
      color: ${props => props.status === 'unavailable' ? 'white' : '#ef4444'};

      &:hover {
        background: #ef4444;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(239,68,68,0.3);
      }
    }

    &.active::after {
      content: '';
      position: absolute;
      top: 4px;
      right: 4px;
      width: 8px;
      height: 8px;
      background: white;
      border-radius: 50%;
    }
  }
`;

const SaveButton = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #1e40af, #1e3a8a);  /* CHANGED: from #2563eb/#1d4ed8 to #1e40af/#1e3a8a */
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  margin-top: 8px;
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
    box-shadow: 0 10px 20px -5px rgba(30,64,175,0.3);  /* CHANGED: rgba values */

    &::after {
      left: 100%;
    }
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }

  .icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: #dbeafe;  /* CHANGED: from #f1f5f9 to #dbeafe (light blue like MyStats) */
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1e40af;  /* CHANGED: from #64748b to #1e40af */
    font-size: 18px;
    flex-shrink: 0;
  }

  .info {
    flex: 1;

    .label {
      font-size: 12px;
      color: #94a3b8;
      margin-bottom: 2px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .value {
      font-size: 15px;
      font-weight: 600;
      color: #1e293b;
    }
  }
`;

const Settings = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    roomNumber: '',
    block: '',
    floor: '',
    maxQueueLimit: 20,
  });
  const [status, setStatus] = useState('available');
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordError, setPasswordError] = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await staffAPI.getProfile();
      if (res.data?.success) {
        const s = res.data.staff;
        setProfile({
          firstName: s.first_name || '',
          lastName: s.last_name || '',
          email: s.email || '',
          roomNumber: s.room_number || '',
          block: s.block || '',
          floor: s.floor || '',
          maxQueueLimit: s.max_queue_limit || 20,
        });

        if (s.is_paused) setStatus('paused');
        else if (s.is_available) setStatus('available');
        else setStatus('unavailable');
      }
    } catch (err) {
      console.error('Profile load error:', err);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const validateProfile = () => {
    const newErrors = {};
    if (!profile.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!profile.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (profile.maxQueueLimit < 1 || profile.maxQueueLimit > 100) {
      newErrors.maxQueueLimit = 'Must be between 1 and 100';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordStrength = useCallback((pwd) => {
    if (!pwd) return '';
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd);
    
    if (!hasUpperCase && !hasSpecialChar) {
      return 'Password must contain at least one uppercase letter and one special character';
    }
    if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character';
    }
    return '';
  }, []);

  const handleStatusChange = async (newStatus) => {
    try {
      const data = {
        isAvailable: newStatus === 'available' ? 1 : 0,
        isPaused: newStatus === 'paused' ? 1 : 0,
        reason: `Status changed to ${newStatus} from settings`
      };

      await staffAPI.updateAvailability(data);
      setStatus(newStatus);

      if (newStatus === 'unavailable') {
       toast.error(`Status updated to ${newStatus}`, {
  style: { background: '#dc2626', color: 'white' },
  iconTheme: { primary: 'white', secondary: '#dc2626' }
});
      } else if (newStatus === 'paused') {
        toast.success(`Status updated to ${newStatus}`, {
          style: { background: '#f59e0b', color: 'white' },
          iconTheme: { primary: 'white', secondary: '#f59e0b' }
        });
      } else {
        toast.success(`Status updated to ${newStatus}`, {
          style: { background: '#10b981', color: 'white' },
          iconTheme: { primary: 'white', secondary: '#10b981' }
        });
      }

      if (newStatus === 'paused') {
        toast.info('Students will be notified about the pause', {
          autoClose: 5000,
          style: { background: '#3b82f6', color: 'white' },
          iconTheme: { primary: 'white', secondary: '#3b82f6' }
        });
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;

    setSaving(true);
    try {
      await staffAPI.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        roomNumber: profile.roomNumber,
        block: profile.block,
        floor: profile.floor,
        maxQueueLimit: profile.maxQueueLimit,
      });
      toast.success('Profile updated successfully');
      setErrors({});
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!password.current) newErrors.currentPassword = 'Current password is required';
    if (!password.new) {
      newErrors.newPassword = 'New password is required';
    } else {
      const strengthError = validatePasswordStrength(password.new);
      if (strengthError) {
        newErrors.newPassword = strengthError;
      }
    }
    if (password.new !== password.confirm) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setSaving(true);
    try {
      await staffAPI.updateProfile({ 
        password: password.new,
        currentPassword: password.current 
      });
      toast.success('Password changed successfully');
      setPassword({ current: '', new: '', confirm: '' });
      setPasswordError('');
      setErrors(prev => ({ 
        ...prev, 
        currentPassword: '', 
        newPassword: '', 
        confirmPassword: '' 
      }));
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to change password';
      if (errorMsg.includes('current') || errorMsg.includes('incorrect')) {
        setErrors(prev => ({ ...prev, currentPassword: 'Current password is incorrect' }));
      }
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
        <FaSpinner className="spinner" style={{ fontSize: 32, animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: 16 }}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader>
        <h2><FaCog color="#1e40af" /> Settings</h2>  {/* CHANGED: from #2563eb to #1e40af */}
        <p>Manage your profile, availability, and preferences</p>
      </PageHeader>

      <SettingsGrid>
        <Card>
          <div className="card-header">
            <FaUserTie />
            <h3>Profile Information</h3>
          </div>

          <form onSubmit={handleProfileUpdate}>
            <FormRow>
              <FormGroup>
                <label>First Name *</label>
                <input 
                  type="text"
                  value={profile.firstName}
                  disabled
                  className={errors.firstName ? 'error' : ''}
                  placeholder="Enter first name"
                />
                <div className="hint"><FaShieldAlt /> Name cannot be changed. Contact admin for assistance.</div>
                {errors.firstName && <div className="error-msg">{errors.firstName}</div>}
              </FormGroup>
              <FormGroup>
                <label>Last Name *</label>
                <input 
                  type="text"
                  value={profile.lastName}
                  disabled
                  className={errors.lastName ? 'error' : ''}
                  placeholder="Enter last name"
                />
                <div className="hint"><FaShieldAlt /> Name cannot be changed. Contact admin for assistance.</div>
                {errors.lastName && <div className="error-msg">{errors.lastName}</div>}
              </FormGroup>
            </FormRow>

            <FormGroup>
              <label><FaEnvelope /> Email</label>
              <input 
                type="email"
                value={profile.email}
                disabled
              />
              <div className="hint"><FaShieldAlt /> Email cannot be changed. Contact admin for assistance.</div>
            </FormGroup>

            <FormRow>
              <FormGroup>
                <label><FaBuilding /> Room Number</label>
                <input 
                  type="text"
                  value={profile.roomNumber}
                  disabled
                  placeholder="e.g. A-101"
                />
              </FormGroup>
              <FormGroup>
                <label><FaLayerGroup /> Block</label>
                <input 
                  type="text"
                  value={profile.block}
                  disabled
                  placeholder="e.g. Block A"
                />
              </FormGroup>
              <FormGroup>
                <label><FaLayerGroup /> Floor</label>
                <input 
                  type="text"
                  value={profile.floor}
                  disabled
                  placeholder="e.g. 1st Floor"
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <label><FaUserTie /> Max Queue Limit</label>
              <input 
                type="number"
                min="1"
                max="100"
                value={profile.maxQueueLimit}
                disabled
                className={errors.maxQueueLimit ? 'error' : ''}
              />
              <div className="hint">Maximum number of people allowed in your queue (1-100)</div>
              {errors.maxQueueLimit && <div className="error-msg">{errors.maxQueueLimit}</div>}
            </FormGroup>
          </form>
        </Card>

        <div>
          <Card style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <FaCheckCircle />
              <h3>Availability Status</h3>
            </div>

            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px', lineHeight: 1.5 }}>
              Set your current availability. When paused, students will receive a notification about the delay.
            </p>

            <StatusToggle status={status}>
              <button 
                className={`available ${status === 'available' ? 'active' : ''}`}
                onClick={() => handleStatusChange('available')}
              >
                <FaCheckCircle /> Available
              </button>
              <button 
                className={`paused ${status === 'paused' ? 'active' : ''}`}
                onClick={() => handleStatusChange('paused')}
              >
                <FaPause /> Emergency Pause
              </button>
              <button 
                className={`unavailable ${status === 'unavailable' ? 'active' : ''}`}
                onClick={() => handleStatusChange('unavailable')}
              >
                <FaExclamationTriangle /> Unavailable
              </button>
            </StatusToggle>
          </Card>

          <Card style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <FaMapMarkerAlt />
              <h3>Location Details</h3>
            </div>

            <InfoRow>
              <div className="icon"><FaBuilding /></div>
              <div className="info">
                <div className="label">Room</div>
                <div className="value">{profile.roomNumber || 'Not set'}</div>
              </div>
            </InfoRow>

            <InfoRow>
              <div className="icon"><FaLayerGroup /></div>
              <div className="info">
                <div className="label">Block</div>
                <div className="value">{profile.block || 'Not set'}</div>
              </div>
            </InfoRow>

            <InfoRow>
              <div className="icon"><FaLayerGroup /></div>
              <div className="info">
                <div className="label">Floor</div>
                <div className="value">{profile.floor || 'Not set'}</div>
              </div>
            </InfoRow>
          </Card>

          <Card>
            <div className="card-header">
              <FaLock />
              <h3>Change Password</h3>
            </div>

            <form onSubmit={handlePasswordChange}>
              <FormGroup>
                <label><FaLock /> Current Password *</label>
                <PasswordInputWrapper>
                  <input 
                    type={showPassword.current ? 'text' : 'password'}
                    value={password.current}
                    onChange={(e) => {
                      setPassword({...password, current: e.target.value});
                      setErrors(prev => ({ ...prev, currentPassword: '' }));
                    }}
                    className={errors.currentPassword ? 'error' : ''}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                  >
                    {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </PasswordInputWrapper>
                {errors.currentPassword && <div className="error-msg">{errors.currentPassword}</div>}
              </FormGroup>

              <FormGroup>
                <label><FaShieldAlt /> New Password *</label>
                <PasswordInputWrapper>
                  <input 
                    type={showPassword.new ? 'text' : 'password'}
                    value={password.new}
                    onChange={(e) => {
                      setPassword({...password, new: e.target.value});
                      setPasswordError(validatePasswordStrength(e.target.value));
                      setErrors(prev => ({ ...prev, newPassword: '' }));
                    }}
                    className={errors.newPassword || passwordError ? 'error' : ''}
                    placeholder="Min 6 characters, uppercase & special char"
                  />
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                  >
                    {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </PasswordInputWrapper>
                {passwordError && (
                  <div style={{
                    marginTop: '6px',
                    fontSize: '13px',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ fontSize: '14px' }}>⚠️</span>
                    {passwordError}
                  </div>
                )}
                {!passwordError && password.new && (
                  <div style={{
                    marginTop: '6px',
                    fontSize: '13px',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ fontSize: '14px' }}>✅</span>
                    Password looks good
                  </div>
                )}
                {errors.newPassword && !passwordError && <div className="error-msg">{errors.newPassword}</div>}
              </FormGroup>

              <FormGroup>
                <label><FaCheckCircle /> Confirm Password *</label>
                <PasswordInputWrapper>
                  <input 
                    type={showPassword.confirm ? 'text' : 'password'}
                    value={password.confirm}
                    onChange={(e) => {
                      setPassword({...password, confirm: e.target.value});
                      setErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }}
                    className={errors.confirmPassword ? 'error' : ''}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                  >
                    {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </PasswordInputWrapper>
                {errors.confirmPassword && <div className="error-msg">{errors.confirmPassword}</div>}
              </FormGroup>

              <SaveButton type="submit" disabled={saving}>
                {saving ? <><FaSpinner className="spinner" /> Changing...</> : <><FaLock /> Change Password</>}
              </SaveButton>
            </form>
          </Card>
        </div>
      </SettingsGrid>
    </div>
  );
};

export default Settings;