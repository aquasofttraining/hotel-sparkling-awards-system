import React from 'react';

const HotelList = ({ onlyManagedByUser }: { onlyManagedByUser?: boolean }) => {
  return (
    <div style={{ border: '1px dashed #ccc', padding: '1rem' }}>
      <strong>HotelList</strong> — Showing: {onlyManagedByUser ? 'Managed Hotels' : 'All Hotels'}
    </div>
  );
};

export default HotelList;
