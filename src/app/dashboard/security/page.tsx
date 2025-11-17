'use client';

import { useState, useEffect } from 'react';
import { FiShield, FiCheck, FiX, FiSettings } from 'react-icons/fi';
import TwoFactorSetup from '@/components/auth/TwoFactorSetup';
import '../../../styles/two-factor.css';

interface User {
  id: string;
  email: string;
  two_factor_enabled: boolean;
}

export default function SecurityPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        setError('Failed to fetch user data');
      }
    } catch (error) {
      setError('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupComplete = () => {
    setShowSetup(false);
    fetchUserData(); // Refresh user data
  };

  const disableTwoFactor = async () => {
    if (!confirm('Are you sure you want to disable Two-Factor Authentication? This will make your account less secure.')) {
      return;
    }

    setDisabling(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch('/api/auth/disable-2fa', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        fetchUserData(); // Refresh user data
        alert('Two-Factor Authentication has been disabled');
      } else {
        setError(data.error || 'Failed to disable 2FA');
      }
    } catch (error) {
      setError('Failed to disable 2FA');
    } finally {
      setDisabling(false);
    }
  };

  if (loading) {
    return (
      <div className="security-page">
        <div className="loading-container">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (showSetup) {
    return (
      <div className="security-page">
        <TwoFactorSetup
          onComplete={handleSetupComplete}
          onCancel={() => setShowSetup(false)}
        />
      </div>
    );
  }

  return (
    <div className="security-page">
      <div className="security-container">
        <div className="security-header">
          <h1>Security Settings</h1>
          <p>Manage your account security and two-factor authentication</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="security-section">
          <div className="section-header">
            <div className="section-icon">
              <FiShield size={24} />
            </div>
            <div>
              <h2>Two-Factor Authentication</h2>
              <p>Add an extra layer of security to your account</p>
            </div>
            <div className="section-status">
              {user?.two_factor_enabled ? (
                <div className="status-enabled">
                  <FiCheck size={20} />
                  Enabled
                </div>
              ) : (
                <div className="status-disabled">
                  <FiX size={20} />
                  Disabled
                </div>
              )}
            </div>
          </div>

          <div className="section-content">
            {user?.two_factor_enabled ? (
              <div className="enabled-content">
                <div className="enabled-info">
                  <h3>2FA is currently enabled</h3>
                  <p>Your account is protected by time-based one-time passwords (TOTP). You'll need to enter a code from your authenticator app when signing in.</p>
                </div>
                
                <div className="enabled-actions">
                  <button
                    onClick={disableTwoFactor}
                    disabled={disabling}
                    className="btn-danger"
                  >
                    {disabling ? 'Disabling...' : 'Disable 2FA'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="disabled-content">
                <div className="disabled-info">
                  <h3>2FA is not enabled</h3>
                  <p>Protect your account by enabling two-factor authentication. This adds an extra step to your login process using an authenticator app.</p>
                  
                  <div className="benefits-list">
                    <h4>Benefits:</h4>
                    <ul>
                      <li>Enhanced security against unauthorized access</li>
                      <li>Protection even if your password is compromised</li>
                      <li>Compatible with popular authenticator apps</li>
                      <li>Backup codes for emergency access</li>
                    </ul>
                  </div>
                </div>
                
                <div className="disabled-actions">
                  <button
                    onClick={() => setShowSetup(true)}
                    className="btn-primary"
                  >
                    <FiSettings size={16} />
                    Enable 2FA
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="account-info">
          <h3>Account Information</h3>
          <div className="info-item">
            <span className="info-label">Email:</span>
            <span className="info-value">{user?.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}