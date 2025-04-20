import React from 'react';
import '../styles/Message.css';

const Message = ({ type = "info", children, onClose }) => {
  return (
    <div className={`app-message app-message-${type}`}>
      <span>{children}</span>
      {onClose && (
        <button className="app-message-close" onClick={onClose}>&times;</button>
      )}
    </div>
  );
};

export default Message;