import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import Loader from './Loader';

// PageLoader.jsx
const PageLoader = ({ children }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState(location.pathname);

  if (location.pathname !== currentPath) {
    if (location.pathname !== "/") {
      setLoading(true);
    }
    setCurrentPath(location.pathname);
  }

  return (
    <>
      {loading && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999 }}>
          <Loader fast onComplete={() => setLoading(false)} />
        </div>
      )}
      <div style={{ display: loading ? 'none' : 'block', width: '100%', height: '100%' }}>
        {children}
      </div>
    </>
  );
};

export default PageLoader;
