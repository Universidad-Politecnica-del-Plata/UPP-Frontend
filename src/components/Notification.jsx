import React from 'react';
import { notificationStyles } from '../styles/notification-styles';
import { iconStyles } from '../styles/icon-styles';

const Notification = ({ show, type, message, onClose }) => {
  if (!show) return null;

  return (
    <div style={notificationStyles.banner(show, type)}>
      <div style={notificationStyles.content}>
        <div style={notificationStyles.icon}>
          {type === 'success' ? (
            <div style={{ ...iconStyles.icon, ...iconStyles.successIcon }}>
              <span style={iconStyles.checkmark}>✓</span>
            </div>
          ) : (
            <div style={{ ...iconStyles.icon, ...iconStyles.alertIcon }}>
              <span style={iconStyles.x}>x</span>
            </div>
          )}
        </div>
        <div style={notificationStyles.message}>{message}</div>
      </div>
      <button 
        style={notificationStyles.closeButton} 
        onClick={onClose}
      >
        <span style={iconStyles.xLarge}>×</span>
      </button>
    </div>
  );
};

export default Notification;
