import { Pipeline, createStep, PipelineStep } from '../../services/common/Pipeline';

// Types for messages and responses
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  text: string;
  businessSuggestions?: Business[];
}

export interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  logo?: string;
  website?: string;
}

// Mock data for service categories
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

// Define the type for our pipeline data
interface PipelineData {
  message: string;
  category: string | null;
  response: ChatResponse;
}

// Check for specific service types in the user message
const serviceDetectionStep: PipelineStep<PipelineData> = {
  execute: (data) => {
    const lowercaseMessage = data.message.toLowerCase();
    let category: string | null = null;
    
    if (lowercaseMessage.includes('legal') || lowercaseMessage.includes('lawyer') || lowercaseMessage.includes('attorney')) {
      category = 'legal';
    } else if (lowercaseMessage.includes('account') || lowercaseMessage.includes('bookkeeping')) {
      category = 'accounting';
    } else if (lowercaseMessage.includes('tax') || lowercaseMessage.includes('filing')) {
      category = 'tax-filing';
    }
    
    return { ...data, category };
  }
};

// Generate response based on detected service category
const responseGenerationStep: PipelineStep<PipelineData> = {
  execute: (data) => {
    let response: ChatResponse = {
      text: "I can help you find service providers in Papua New Guinea. Could you please specify what type of service you're looking for? For example: legal services, accounting, tax filing assistance, etc."
    };
    
    if (data.category) {
      const businesses = businessesByCategory[data.category] || [];
      
      let content = '';
      switch(data.category) {
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
      
      response = {
        text: content,
        businessSuggestions: businesses
      };
    }
    
    return { ...data, response };
  }
};

// Business-specific response generation
const generateBusinessResponse = (business: Business, userMessage: string): string => {
  const lowercaseQuery = userMessage.toLowerCase();
  
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

// Currently using a mock implementation, but prepared for AI integration
export async function processUserMessage(message: string, selectedBusiness: Business | null): Promise<ChatResponse> {
  // If a business is selected, generate business-specific response
  if (selectedBusiness) {
    return {
      text: generateBusinessResponse(selectedBusiness, message)
    };
  }
  
  // Otherwise, use the service detection pipeline
  const pipeline = new Pipeline<PipelineData>()
    .addStep(serviceDetectionStep)
    .addStep(responseGenerationStep);
  
  const result = await pipeline.process({
    message,
    category: null,
    response: {
      text: ""
    }
  });
  
  return result.response;
}

// This is where we would integrate with the AI model via Supabase
// For now it's prepared but commented out as we'd need Supabase integration
/*
export async function processWithAIModel(messages: ChatMessage[]): Promise<string> {
  try {
    // This would call a Supabase Edge Function that accesses the AI model
    const response = await fetch('YOUR_SUPABASE_FUNCTION_URL', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error calling AI service:', error);
    return "I'm sorry, I encountered an issue processing your request. Please try again.";
  }
}
*/
