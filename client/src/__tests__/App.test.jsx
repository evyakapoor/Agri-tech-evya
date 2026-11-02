import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { AuthProvider } from '../context/AuthContext.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { LandingPage } from '../pages/LandingPage.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';
import '../i18n/index.js';

describe('Frontend Component & UI Flow Tests', () => {
  it('Renders StatCard component with custom values and badges', () => {
    render(
      <StatCard
        title="Total Crops"
        value="12"
        icon="flower1"
        color="success"
        subtitle="Healthy vegetation"
        badgeText="+2 this month"
      />
    );

    expect(screen.getByText('Total Crops')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Healthy vegetation')).toBeInTheDocument();
    expect(screen.getByText('+2 this month')).toBeInTheDocument();
  });

  it('Renders LandingPage with agricultural hero header and call-to-actions', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Crop Intelligence/i)).toBeInTheDocument();
    expect(screen.getByText(/Start Managing Your Farm/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign In to Dashboard/i)).toBeInTheDocument();
  });

  it('Renders LoginPage with email, password fields and quick demo buttons', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('farmer@agritech.com')).toBeInTheDocument();
    expect(screen.getByText(/Farmer Demo/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin Demo/i)).toBeInTheDocument();
  });
});
