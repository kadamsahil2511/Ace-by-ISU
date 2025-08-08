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
    const style = document.createElement('style');
    style.textContent = `
      df-messenger {
        z-index: 999;
        position: fixed;
        --df-messenger-font-color: #f3f4f6;
        --df-messenger-font-family: inherit;
        --df-messenger-chat-background: rgba(17, 24, 39, 0.8);
        --df-messenger-message-user-background: rgba(37, 99, 235, 0.8);
        --df-messenger-message-bot-background: rgba(31, 41, 55, 0.6);
        --df-messenger-button-color: rgba(37, 99, 235, 0.8);
        --df-messenger-chat-border-radius: 1rem;
        --df-messenger-input-box-color: rgba(17, 24, 39, 0.6);
        --df-messenger-input-placeholder-font-color: #9ca3af;
        --df-messenger-input-font-color: #f3f4f6;
        --df-messenger-send-icon: rgba(37, 99, 235, 0.8);
        --df-messenger-chip-color: rgba(37, 99, 235, 0.8);
        --df-messenger-chip-border-color: rgba(37, 99, 235, 0.1);
        bottom: 20px;
        right: 20px;
        max-height: 85vh;
      }

      df-messenger-chat {
        border: 1px solid rgba(37, 99, 235, 0.1) !important;
        border-radius: 1rem !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
        background-color: rgba(17, 24, 39, 0.8) !important;
        backdrop-filter: blur(16px) !important;
      }

      df-messenger-titlebar {
        background-color: rgba(17, 24, 39, 0.6) !important;
        border-bottom: 1px solid rgba(37, 99, 235, 0.1) !important;
        border-radius: 1rem 1rem 0 0 !important;
        color: #f3f4f6 !important;
        padding: 1.25rem !important;
        font-weight: 600 !important;
      }

      df-messenger-message {
        font-size: 0.875rem !important;
        line-height: 1.25rem !important;
        padding: 0.75rem 1rem !important;
        margin: 0.75rem 1rem !important;
      }

      df-messenger-user-message {
        background-color: rgba(37, 99, 235, 0.8) !important;
        border-radius: 1rem !important;
        color: #ffffff !important;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
      }

      df-messenger-bot-message {
        background-color: rgba(31, 41, 55, 0.6) !important;
        border-radius: 1rem !important;
        color: #f3f4f6 !important;
        border: 1px solid rgba(37, 99, 235, 0.1) !important;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
      }

      df-messenger-wrapper {
        background-color: transparent !important;
      }

      df-messenger-input-box {
        border-top: 1px solid rgba(37, 99, 235, 0.1) !important;
        background-color: rgba(17, 24, 39, 0.6) !important;
        padding: 1.25rem !important;
      }

      df-messenger-input-box-input {
        color: #f3f4f6 !important;
        background-color: rgba(31, 41, 55, 0.6) !important;
        border: 1px solid rgba(37, 99, 235, 0.1) !important;
        border-radius: 0.75rem !important;
        padding: 0.75rem 1rem !important;
        transition: all 0.2s ease !important;
      }

      df-messenger-input-box-input:focus {
        outline: none !important;
        border-color: rgba(37, 99, 235, 0.3) !important;
        box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1) !important;
      }

      df-messenger-button {
        background-color: rgba(37, 99, 235, 0.8) !important;
        color: #ffffff !important;
        border-radius: 0.75rem !important;
        padding: 0.75rem 1rem !important;
        transition: all 0.2s ease !important;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
      }

      df-messenger-button:hover {
        background-color: rgba(37, 99, 235, 0.9) !important;
        transform: translateY(-1px) !important;
      }

      df-messenger-chat-bubble {
        background-color: rgba(37, 99, 235, 0.8) !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        transition: all 0.2s ease !important;
      }

      df-messenger-chat-bubble:hover {
        transform: scale(1.05) !important;
        background-color: rgba(37, 99, 235, 0.9) !important;
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
      <df-messenger-chat-bubble chat-title="AI Learning Assistant" />
    </df-messenger>
  );
};

export default DialogflowMessenger; 