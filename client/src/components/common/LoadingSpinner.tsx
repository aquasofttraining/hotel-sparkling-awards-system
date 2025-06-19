import React from 'react';
import './LoadingSpinner.css'; // dacă ai stiluri, altfel șterge această linie

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-spinner-container">
      <div className="spinner" />
      <p>Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
