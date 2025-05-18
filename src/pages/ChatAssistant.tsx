
import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import AnimatedBackground from '@/components/chat/AnimatedBackground';
import { useIsTyping } from '@/hooks/useIsTyping';
import { processUserMessage, Business } from '@/services/ai/AIService';

// Define message types
type MessageRole = 'user' | 'assistant' | 'system';

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  businesses?: Business[];
}

// Initial welcome message
const welcomeMessage: Message = {
  id: '0',
  role: 'assistant',
  content: "Hello! I'm your Wantok assistant. I can help you find the right service providers in Papua New Guinea. What type of service are you looking for today? For example: legal services, accounting, tax filing assistance, etc.",
  timestamp: new Date(),
};

const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isTyping } = useIsTyping({ text: input });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Function to handle sending messages
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Process the message using our AI service
      const response = await processUserMessage(input, selectedBusiness);
      
      // Create response message
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        businesses: response.businessSuggestions
      };
      
      setMessages(prev => [...prev, responseMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an issue processing your request. Please try again.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle business selection
  const selectBusiness = (business: Business) => {
    setSelectedBusiness(business);
    
    const systemMessage: Message = {
      id: Date.now().toString(),
      role: 'system',
      content: `You are now chatting with ${business.name}`,
      timestamp: new Date(),
    };
    
    const welcomeMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `Hello! Welcome to ${business.name}. ${business.description} How can I assist you today?`,
      timestamp: new Date(),
    };
    
    setMessages([systemMessage, welcomeMessage]);
  };

  // Reset to main chatbot
  const resetChat = () => {
    setSelectedBusiness(null);
    setMessages([welcomeMessage]);
  };

  return (
    <div className="container mx-auto py-8 h-[calc(100vh-8rem)] relative">
      {/* Animated Background */}
      <AnimatedBackground isTyping={isTyping} />
      
      <Card className="flex flex-col h-full shadow-lg border-2 bg-background/80 backdrop-blur-sm">
        {/* Chat header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 bg-primary/10">
              <AvatarImage src={selectedBusiness?.logo || "/placeholder.svg"} />
              <AvatarFallback className="bg-primary/10 text-primary">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">
                {selectedBusiness ? selectedBusiness.name : "Wantok"}
              </h2>
              {selectedBusiness && (
                <p className="text-xs text-muted-foreground">{selectedBusiness.category}</p>
              )}
            </div>
          </div>
          {selectedBusiness && (
            <Button variant="ghost" size="sm" onClick={resetChat}>
              Back to Services
            </Button>
          )}
        </div>
        
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={cn(
                "flex mb-4",
                message.role === 'user' ? "justify-end" : "justify-start",
                message.role === 'system' && "justify-center"
              )}
            >
              {message.role === 'system' ? (
                <div className="bg-muted rounded-md py-2 px-4 text-sm text-center max-w-[80%]">
                  {message.content}
                </div>
              ) : (
                <div className={cn(
                  "flex gap-3 max-w-[80%]",
                  message.role === 'user' && "flex-row-reverse"
                )}>
                  <Avatar className="h-8 w-8 mt-1">
                    {message.role === 'assistant' ? (
                      <>
                        <AvatarImage 
                          src={selectedBusiness?.logo || "/placeholder.svg"} 
                          alt={selectedBusiness?.name || "Wantok"} 
                        />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <Bot className="h-5 w-5" />
                        </AvatarFallback>
                      </>
                    ) : (
                      <>
                        <AvatarImage src="" alt="User" />
                        <AvatarFallback className="bg-muted">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div>
                    <div className={cn(
                      "rounded-lg py-2 px-3",
                      message.role === 'assistant' 
                        ? "bg-muted text-foreground" 
                        : "bg-primary text-primary-foreground"
                    )}>
                      <p>{message.content}</p>
                    </div>
                    
                    {/* Business listings */}
                    {message.businesses && message.businesses.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.businesses.map((business) => (
                          <div 
                            key={business.id} 
                            className="border rounded-md p-3 bg-background hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => selectBusiness(business)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={business.logo} alt={business.name} />
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {business.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-medium text-sm flex items-center">
                                    {business.name}
                                    <ExternalLink className="h-3 w-3 ml-1 text-muted-foreground" />
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    {business.description}
                                  </p>
                                </div>
                              </div>
                              <Button size="sm" variant="ghost" className="text-xs">
                                Chat Now
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground mt-1 px-1">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex gap-3 max-w-[80%]">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={selectedBusiness?.logo || "/placeholder.svg"} 
                    alt={selectedBusiness?.name || "Wantok"} 
                  />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="bg-muted rounded-lg py-2 px-3 text-foreground">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 bg-muted-foreground/30 rounded-full animate-pulse" />
                      <div className="h-2 w-2 bg-muted-foreground/30 rounded-full animate-pulse delay-150" />
                      <div className="h-2 w-2 bg-muted-foreground/30 rounded-full animate-pulse delay-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message here..."
              className="resize-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="shrink-0"
            >
              <Send className="h-4 w-4 mr-1" />
              Send
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2 text-center">
            {selectedBusiness 
              ? `You are chatting with ${selectedBusiness.name}'s virtual assistant`
              : "Wantok - Connecting you with service providers in Papua New Guinea"}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatAssistant;
