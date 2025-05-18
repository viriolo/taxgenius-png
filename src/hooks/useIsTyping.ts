
import { useState, useEffect } from 'react';

interface UseIsTypingProps {
  text: string;
  typingTimeout?: number;
}

/**
 * A hook to detect if a user is actively typing based on input changes
 * @param text The current input text to monitor
 * @param typingTimeout How long after the last keystroke to consider typing has stopped (ms)
 * @returns Object with isTyping state
 */
export function useIsTyping({ text, typingTimeout = 1000 }: UseIsTypingProps) {
  const [isTyping, setIsTyping] = useState(false);
  
  useEffect(() => {
    // If text changes, set isTyping to true
    if (text) {
      setIsTyping(true);
      
      // Set a timeout to mark typing as complete after the timeout
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, typingTimeout);
      
      // Clear the timeout if the component unmounts or text changes again
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [text, typingTimeout]);
  
  return { isTyping };
}
