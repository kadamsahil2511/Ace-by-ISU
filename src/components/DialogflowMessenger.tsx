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
    // Add custom styles to match the dark theme
    const style = document.createElement('style');
    style.textContent = `
      df-messenger {
        z-index: 999;
        position: fixed;
        --df-messenger-font-color: #fff;
        --df-messenger-font-family: inherit;
        --df-messenger-chat-background: #111827;
        --df-messenger-message-user-background: #2563eb;
        --df-messenger-message-bot-background: #1f2937;
        --df-messenger-button-color: #2563eb;
        --df-messenger-chat-border-radius: 0.75rem;
        --df-messenger-input-box-color: #1f2937;
        --df-messenger-input-placeholder-font-color: #9ca3af;
        --df-messenger-input-font-color: #fff;
        --df-messenger-send-icon: #2563eb;
        --df-messenger-chip-color: #2563eb;
        --df-messenger-chip-border-color: #2563eb;
        bottom: 16px;
        right: 16px;
      }

      df-messenger-chat {
        border: 1px solid rgba(37, 99, 235, 0.3) !important;
        border-radius: 0.75rem !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
      }

      df-messenger-titlebar {
        background-color: #1f2937 !important;
        border-bottom: 1px solid rgba(37, 99, 235, 0.3) !important;
        border-radius: 0.75rem 0.75rem 0 0 !important;
      }

      df-messenger-message {
        font-size: 0.875rem !important;
        line-height: 1.25rem !important;
      }

      df-messenger-user-message {
        background-color: #2563eb !important;
        border-radius: 0.5rem !important;
      }

      df-messenger-bot-message {
        background-color: #1f2937 !important;
        border-radius: 0.5rem !important;
      }

      df-messenger-input-box {
        border-top: 1px solid rgba(37, 99, 235, 0.3) !important;
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
      <df-messenger-chat-bubble chat-title="AI Assistant" />
    </df-messenger>
  );
};

export default DialogflowMessenger; 