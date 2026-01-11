import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check local storage on mount
    const storedAuth = localStorage.getItem('genrx_auth');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      setUser({ username: 'admin', name: 'Admin User' });
    }
  }, []);

  const login = (username, password) => {
    if (username === 'admin' && password === 'admin') {
      localStorage.setItem('genrx_auth', 'true');
      setIsAuthenticated(true);
      setUser({ username: 'admin', name: 'Admin User' });
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('genrx_auth');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
