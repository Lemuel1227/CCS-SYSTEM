import React from 'react';

const PlaceholderPage = ({ title }) => {
  return (
    <div style={{ padding: '2rem', color: 'inherit' }}>
      <h1>{title}</h1>
      <p style={{ opacity: 0.8 }}>This is the {title} page content.</p>
    </div>
  );
};

export default PlaceholderPage;
