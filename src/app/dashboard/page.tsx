'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleVideoLoad = () => {
    setLogoLoaded(true);
  };

  // Statistics data
  const leftStats = [
    { label: 'Total Visits', value: '24,567' },
    { label: 'Unique Visitors', value: '18,432' },
    { label: 'Top 5 Projects Views', value: '12,890' }
  ];

  const rightStats = [
    { label: 'Resume Download Count', value: '3,421' },
    { label: 'Contact Form Submissions', value: '567' },
    { label: 'Traffic Sources', value: '12' }
  ];

  const allStats = [...leftStats, ...rightStats];

  if (!mounted) return null;

  return (
    <div className="dashboard-home">
      {/* Main Content */}
      <div className="dashboard-content">
        {/* Stats and Logo Section */}
        <div className="stats-logo-container">
          {/* Left Side Stats */}
          <div className="stats-left">
            {leftStats.map((stat, index) => (
              <div key={stat.label} className={`stat-item stat-left-${index + 1}`}>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Logo Section */}
          <div className="logo-section">
            <div className={`logo-container ${logoLoaded ? 'loaded' : ''}`}>
              <video
                autoPlay
                muted
                loop
                playsInline
                onLoadedData={handleVideoLoad}
                className="logo-video"
              >
                <source src="/logo.webm" type="video/webm" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* Right Side Stats */}
          <div className="stats-right">
            {rightStats.map((stat, index) => (
              <div key={stat.label} className={`stat-item stat-right-${index + 1}`}>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Welcome Message */}
        <div className="welcome-message">
          <h1 className="welcome-text">
            Good to see you again. Let&apos;s make progress today<span className="accent-dot">.</span>
          </h1>
        </div>

        {/* Mobile Stats Grid */}
        <div className="mobile-stats">
          {allStats.map((stat, index) => (
            <div key={stat.label} className="mobile-stat-item">
              <div className="mobile-stat-value">{stat.value}</div>
              <div className="mobile-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}