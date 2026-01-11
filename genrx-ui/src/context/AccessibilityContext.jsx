import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => useContext(AccessibilityContext);

export const AccessibilityProvider = ({ children }) => {
  const [isElderlyMode, setIsElderlyMode] = useState(false);

  const toggleElderlyMode = () => {
    setIsElderlyMode(prev => !prev);
  };

  useEffect(() => {
    // Smooth transition for font size change
    document.documentElement.style.transition = 'font-size 0.3s ease';
    
    if (isElderlyMode) {
      // Increase root font size to 125% (20px by default)
      // This scales up 1rem to 20px, effectively zooming the UI
      document.documentElement.style.fontSize = '20px';
    } else {
      // Reset to default browser size (usually 16px)
      document.documentElement.style.fontSize = '16px';
    }
  }, [isElderlyMode]);

  return (
    <AccessibilityContext.Provider value={{ isElderlyMode, toggleElderlyMode }}>
      {children}
    </AccessibilityContext.Provider>
  );
};
