import { useState } from 'react';

export const useNotification = (timeout = 5000) => {
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, timeout);
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  return { notification, showNotification, closeNotification };
};
