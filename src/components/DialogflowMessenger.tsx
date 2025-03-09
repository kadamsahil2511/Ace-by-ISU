import React, { useEffect } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'df-messenger': any;
      'df-messenger-chat-bubble': any;
    }
  }
}

const DialogflowMessenger: React.FC = () => {
  useEffect(() => {
    // Add custom styles
    const style = document.createElement('style');
    style.textContent = `
      df-messenger {
        z-index: 999;
        position: fixed;
        --df-messenger-font-color: #000;
        --df-messenger-font-family: Google Sans;
        --df-messenger-chat-background: #f3f6fc;
        --df-messenger-message-user-background: #d3e3fd;
        --df-messenger-message-bot-background: #fff;
        bottom: 16px;
        right: 16px;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <df-messenger
      project-id="automatedworkflow"
      agent-id="36965966-7fbe-443a-a386-3a274eab4941"
      language-code="en"
      max-query-length="-1"
    >
      <df-messenger-chat-bubble chat-title="Researcher" />
    </df-messenger>
  );
};

export default DialogflowMessenger; 