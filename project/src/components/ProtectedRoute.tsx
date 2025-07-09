import React, { useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Always show the children (no authentication gate)
  return <>{children}</>;
};

export default ProtectedRoute;