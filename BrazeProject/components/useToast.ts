import { useState } from 'react';

export const useToast = () => {
  const [toastVisible, setToastVisible] = useState(false);
  const [message, setMessage] = useState('Success');

  const showToast = (msg: string) => {
    setMessage(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
      setMessage('Success');
    }, 2000);
  };

  return {
    toastVisible,
    message,
    showToast,
  };
};
