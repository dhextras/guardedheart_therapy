import React from "react";

export type messageType = {
  name: string;
  message: string;
};

export interface ChatInterfaceProps {
  messages: Array<messageType>;
  inputMessage: string;
  onLeave: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: () => void;
}
