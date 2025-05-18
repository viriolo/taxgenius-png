
import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define message types
type MessageRole = 'user' | 'assistant' | 'system';

interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  logo?: string;
  website?: string;
}

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  businesses?: Business[];
}

// Sample businesses data organized by category
const businessesByCategory: Record<string, Business[]> = {
  'legal': [
    { 
      id: 'png-legal', 
      name: 'PNG Legal Services', 
      description: 'Specialized legal services for businesses and individuals in Papua New Guinea.',
      category: 'legal',
      logo: '/placeholder.svg'
    },
    { 
      id: 'pacific-law', 
      name: 'Pacific Law Associates', 
      description: 'Corporate and tax law experts serving clients throughout PNG.',
      category: 'legal'
    }
  ],
  'accounting': [
    { 
      id: 'wantok-accounting', 
      name: 'Wantok Accounting', 
      description: 'Professional accounting and tax preparation services for PNG businesses.',
      category: 'accounting',
      logo: '/placeholder.svg'
    },
    { 
      id: 'png-tax-experts', 
      name: 'PNG Tax Experts', 
      description: 'Specialized in tax compliance and planning for businesses in Papua New Guinea.',
      category: 'accounting'
    }
  ],
  'tax-filing': [
    { 
      id: 'easy-tax', 
      name: 'Easy Tax PNG', 
      description: 'Streamlined tax filing services for individuals and small businesses.',
      category: 'tax-filing',
      logo: '/placeholder.svg'
    },
    { 
      id: 'tax-pro', 
      name: 'Tax Pro Solutions', 
      description: 'Professional tax filing and advisory services.',
      category: 'tax-filing'
    }
  ]
};

// Initial welcome message
const welcomeMessage: Message = {
  id: '0',
  role: 'assistant',
  content: "Hello! I'm your Wantok.ai assistant. I can help you find the right service providers in Papua New Guinea. What type of service are you looking for today? For example: legal services, accounting, tax filing assistance, etc.",
  timestamp: new Date(),
};

const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Function to handle sending messages
  const handleSendMessage = () => {
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
    
    // Simulate response delay
    setTimeout(() => {
      let responseMessage: Message;
      
      if (selectedBusiness) {
        // Business-specific chatbot response
        responseMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: generateBusinessResponse(selectedBusiness, input),
          timestamp: new Date(),
        };
      } else {
        // Check if the user is asking about service types
        const lowercaseInput = input.toLowerCase();
        
        if (lowercaseInput.includes('legal') || lowercaseInput.includes('lawyer') || lowercaseInput.includes('attorney')) {
          responseMessage = generateServiceCategoryResponse('legal');
        } else if (lowercaseInput.includes('account') || lowercaseInput.includes('bookkeeping')) {
          responseMessage = generateServiceCategoryResponse('accounting');
        } else if (lowercaseInput.includes('tax') || lowercaseInput.includes('filing')) {
          responseMessage = generateServiceCategoryResponse('tax-filing');
        } else {
          responseMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "I can help you find service providers in Papua New Guinea. Could you please specify what type of service you're looking for? For example: legal services, accounting, tax filing assistance, etc.",
            timestamp: new Date(),
          };
        }
      }
      
      setMessages(prev => [...prev, responseMessage]);
      setIsLoading(false);
    }, 1000);
  };

  // Generate response for a specific service category
  const generateServiceCategoryResponse = (category: string): Message => {
    const businesses = businessesByCategory[category] || [];
    
    let content = '';
    switch(category) {
      case 'legal':
        content = "Here are some legal service providers in Papua New Guinea that can assist you:";
        break;
      case 'accounting':
        content = "Here are accounting firms in Papua New Guinea that can help with your financial needs:";
        break;
      case 'tax-filing':
        content = "These tax filing services in Papua New Guinea can help you prepare and submit your tax documents:";
        break;
      default:
        content = "Here are some service providers that might help you:";
    }
    
    return {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      businesses
    };
  };

  // Generate a business-specific response
  const generateBusinessResponse = (business: Business, userQuery: string): string => {
    const lowercaseQuery = userQuery.toLowerCase();
    
    if (lowercaseQuery.includes('service') || lowercaseQuery.includes('help') || lowercaseQuery.includes('offer')) {
      return `At ${business.name}, we offer a range of professional services tailored to your needs in Papua New Guinea. Our team specializes in ${business.category} services with personalized attention to each client. How can we assist you today?`;
    } else if (lowercaseQuery.includes('cost') || lowercaseQuery.includes('price') || lowercaseQuery.includes('fee')) {
      return `${business.name}'s fees vary based on the complexity of your needs. We offer competitive rates and transparent pricing. Would you like to schedule a consultation to discuss your specific requirements and get a detailed quote?`;
    } else if (lowercaseQuery.includes('contact') || lowercaseQuery.includes('appointment') || lowercaseQuery.includes('schedule')) {
      return `You can schedule an appointment with ${business.name} by calling our office or sending us your details. Would you like me to arrange a call back from one of our representatives?`;
    } else {
      return `Thank you for your interest in ${business.name}. How can we assist you with your ${business.category} needs today?`;
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
    <div className="container mx-auto py-8 h-[calc(100vh-8rem)]">
      <Card className="flex flex-col h-full shadow-lg border-2">
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
                {selectedBusiness ? selectedBusiness.name : "Wantok.ai Assistant"}
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
                          alt={selectedBusiness?.name || "Wantok.ai"} 
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
                    alt={selectedBusiness?.name || "Wantok.ai"} 
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
              : "Wantok.ai - Connecting you with service providers in Papua New Guinea"}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatAssistant;
