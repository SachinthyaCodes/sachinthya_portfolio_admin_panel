'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiShield, FiCopy, FiCheck, FiDownload } from 'react-icons/fi';

interface TwoFactorSetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function TwoFactorSetup({ onComplete, onCancel }: TwoFactorSetupProps) {
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedCodes, setCopiedCodes] = useState(false);

  const setupTwoFactor = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch('/api/auth/setup-2fa', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Setup failed');
      }

      setQrCode(data.qrCode);
      setBackupCodes(data.backupCodes);
      setStep(2);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  const enableTwoFactor = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch('/api/auth/enable-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token: verificationCode })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setStep(3);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = async () => {
    try {
      await navigator.clipboard.writeText(backupCodes.join('\n'));
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    } catch (error) {
      console.error('Failed to copy codes:', error);
    }
  };

  const downloadBackupCodes = () => {
    const content = `Sachinthya Portfolio Admin - Backup Codes
Generated on: ${new Date().toLocaleDateString()}

IMPORTANT: Save these backup codes in a safe place. 
Each code can only be used once.

${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

Keep these codes secure and accessible in case you lose access to your authenticator app.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="two-factor-setup">
      {step === 1 && (
        <div className="setup-intro">
          <div className="setup-icon">
            <FiShield size={48} />
          </div>
          <h2>Enable Two-Factor Authentication</h2>
          <p>Add an extra layer of security to your admin account with time-based one-time passwords (TOTP).</p>
          
          <div className="benefits">
            <h3>Benefits:</h3>
            <ul>
              <li>Enhanced account security</li>
              <li>Protection against unauthorized access</li>
              <li>Works with popular authenticator apps</li>
              <li>Backup codes for recovery</li>
            </ul>
          </div>

          <div className="setup-actions">
            <button 
              onClick={setupTwoFactor} 
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Setting up...' : 'Setup 2FA'}
            </button>
            {onCancel && (
              <button onClick={onCancel} className="btn-secondary">
                Cancel
              </button>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>
      )}

      {step === 2 && (
        <div className="qr-setup">
          <h2>Scan QR Code</h2>
          <div className="qr-container">
            <Image 
              src={qrCode} 
              alt="2FA QR Code" 
              width={200} 
              height={200}
              className="qr-image"
            />
          </div>
          
          <div className="qr-instructions">
            <h3>Instructions:</h3>
            <ol>
              <li>Open your authenticator app (Google Authenticator, Authy, etc.)</li>
              <li>Scan this QR code with your phone camera</li>
              <li>Enter the 6-digit code from your app below</li>
            </ol>
          </div>
          
          <div className="verification-input">
            <input
              type="text"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="verification-code"
            />
            <button 
              onClick={enableTwoFactor} 
              disabled={loading || verificationCode.length !== 6}
              className="btn-primary"
            >
              {loading ? 'Verifying...' : 'Verify & Enable'}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>
      )}

      {step === 3 && (
        <div className="backup-codes">
          <div className="success-icon">
            <FiCheck size={48} />
          </div>
          <h2>2FA Enabled Successfully!</h2>
          <p>Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.</p>
          
          <div className="codes-container">
            <div className="codes-grid">
              {backupCodes.map((code, index) => (
                <div key={index} className="backup-code">
                  {code}
                </div>
              ))}
            </div>
            
            <div className="codes-actions">
              <button 
                onClick={copyBackupCodes}
                className="btn-secondary"
              >
                <FiCopy size={16} />
                {copiedCodes ? 'Copied!' : 'Copy Codes'}
              </button>
              <button 
                onClick={downloadBackupCodes}
                className="btn-secondary"
              >
                <FiDownload size={16} />
                Download Codes
              </button>
            </div>
          </div>

          <div className="completion-actions">
            <button 
              onClick={onComplete}
              className="btn-primary"
            >
              Complete Setup
            </button>
          </div>

          <div className="warning">
            <strong>Important:</strong> Each backup code can only be used once. Store them securely!
          </div>
        </div>
      )}
    </div>
  );
}