'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiShield, FiKey } from 'react-icons/fi';

interface TwoFactorVerifyProps {
  tempToken: string;
  onSuccess?: () => void;
  onBack?: () => void;
}

export default function TwoFactorVerify({ tempToken, onSuccess, onBack }: TwoFactorVerifyProps) {
  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || (useBackupCode ? code.length !== 8 : code.length !== 6)) {
      setError(useBackupCode ? 'Please enter an 8-character backup code' : 'Please enter a 6-digit verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          code,
          tempToken,
          useBackupCode 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Store the final token
      localStorage.setItem('token', data.token);
      localStorage.removeItem('tempToken');
      
      if (useBackupCode && data.remainingBackupCodes !== undefined) {
        alert(`Verification successful! You have ${data.remainingBackupCodes} backup codes remaining.`);
      }

      // Call success callback or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleBackupCode = () => {
    setUseBackupCode(!useBackupCode);
    setCode('');
    setError('');
  };

  const handleCodeChange = (value: string) => {
    if (useBackupCode) {
      // Allow alphanumeric for backup codes (8 chars)
      const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8);
      setCode(cleaned);
    } else {
      // Only digits for TOTP (6 digits)
      const cleaned = value.replace(/\D/g, '').slice(0, 6);
      setCode(cleaned);
    }
  };

  return (
    <div className="two-factor-verify">
      <div className="verify-container">
        <div className="verify-header">
          <div className="verify-icon">
            {useBackupCode ? <FiKey size={32} /> : <FiShield size={32} />}
          </div>
          <h2>Two-Factor Authentication</h2>
          <p>
            {useBackupCode 
              ? 'Enter one of your backup codes to complete login'
              : 'Enter the 6-digit code from your authenticator app'
            }
          </p>
        </div>

        <form onSubmit={verifyCode} className="verify-form">
          <div className="code-input-container">
            <input
              type="text"
              placeholder={useBackupCode ? 'XXXXXXXX' : '000000'}
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              maxLength={useBackupCode ? 8 : 6}
              className="code-input"
              autoComplete="off"
              autoFocus
            />
            <div className="input-hint">
              {useBackupCode 
                ? '8-character backup code'
                : '6-digit verification code'
              }
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !code || (useBackupCode ? code.length !== 8 : code.length !== 6)}
            className="verify-button"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>

          {error && <div className="error-message">{error}</div>}
        </form>

        <div className="verify-options">
          <button 
            type="button"
            onClick={toggleBackupCode}
            className="toggle-backup-button"
          >
            {useBackupCode 
              ? 'Use authenticator app instead'
              : 'Use backup code instead'
            }
          </button>
          
          {onBack && (
            <button 
              type="button"
              onClick={onBack}
              className="back-button"
            >
              Back to login
            </button>
          )}
        </div>

        {useBackupCode && (
          <div className="backup-warning">
            <strong>Note:</strong> Each backup code can only be used once.
          </div>
        )}
      </div>
    </div>
  );
}