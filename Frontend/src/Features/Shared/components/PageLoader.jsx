import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom';
import Loader from './Loader';

// PageLoader.jsx
const PageLoader = ({ children }) => {
  const location = useLocation();
  const prevPath = useRef(location.pathname);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const from = prevPath.current;
    const to = location.pathname;
    if (to !== from && to !== "/") {
      setLoading(true);
    }
    prevPath.current = to;
  }, [location.pathname]);

  if (loading) {
    return <Loader fast onComplete={() => setLoading(false)} />;
  }

  return children;
};

export default PageLoader
