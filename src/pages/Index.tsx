
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import ServiceCards from "@/components/ServiceCards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlurCard } from "@/components/ui/blur-card";
import { useScrollAnimation } from "@/lib/animations";
import { CheckCircle, Star, Users } from "lucide-react";

const Index = () => {
  const heroProps = {
    title: "wantok.ai",
    subtitle: "AI-powered business discovery and support for Papua New Guinea",
    ctaText: "Find Services",
    ctaLink: "/signup",
    secondaryCtaText: "List Your Business",
    secondaryCtaLink: "#services",
  };
  
  const testimonialAnimation = useScrollAnimation({
    initialClass: 'opacity-0 translate-y-4',
    animateClass: 'opacity-100 translate-y-0 transition-all duration-700 ease-out',
    delay: 300,
  });
  
  const testimonials = [
    {
      name: "James Kobol",
      role: "Business Owner",
      company: "PNGTech Solutions",
      quote: "Wantok.ai helped me find reliable suppliers and connect with new customers. It's become essential for my business growth.",
      rating: 5
    },
    {
      name: "Sarah Waka",
      role: "HR Manager",
      company: "Highland Enterprises",
      quote: "Finding qualified contractors was always a challenge. Wantok.ai made it simple and I can trust the recommendations from the community.",
      rating: 5
    },
    {
      name: "Michael Temu",
      role: "Financial Controller",
      company: "Port Moresby Trading",
      quote: "The AI business advisor feature helped me understand loan requirements and improve my business plan. Excellent support for SMEs.",
      rating: 4
    }
  ];

  return (
    <div className="flex flex-col">
      <main>
        <Hero {...heroProps} />
        <ServiceCards />
        
        <section className="py-16">
          <div className="container max-w-6xl px-4 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose Wantok.ai</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Your trusted platform for business discovery, SME support, and community connections across Papua New Guinea.
              </p>
            </div>
            
            <Tabs defaultValue="businesses" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="businesses">For Businesses</TabsTrigger>
                <TabsTrigger value="individuals">For Individuals</TabsTrigger>
              </TabsList>
              <TabsContent value="businesses">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <BlurCard className="p-6">
                    <div className="mb-4 p-3 rounded-full bg-secondary/50 inline-flex">
                      <CheckCircle className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Business Discovery</h3>
                    <p className="text-muted-foreground">
                      Find reliable services, suppliers, and partners across PNG with AI-powered search and recommendations.
                    </p>
                  </BlurCard>
                  
                  <BlurCard className="p-6">
                    <div className="mb-4 p-3 rounded-full bg-secondary/50 inline-flex">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">SME Support</h3>
                    <p className="text-muted-foreground">
                      Get AI-powered business advice on pricing, marketing, compliance, and funding opportunities.
                    </p>
                  </BlurCard>
                  
                  <BlurCard className="p-6">
                    <div className="mb-4 p-3 rounded-full bg-secondary/50 inline-flex">
                      <Star className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Digital Visibility</h3>
                    <p className="text-muted-foreground">
                      Showcase your business online and connect with customers through our trusted platform.
                    </p>
                  </BlurCard>
                </div>
              </TabsContent>
              
              <TabsContent value="individuals">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <BlurCard className="p-6">
                    <div className="mb-4 p-3 rounded-full bg-secondary/50 inline-flex">
                      <CheckCircle className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Service Discovery</h3>
                    <p className="text-muted-foreground">
                      Quickly find mechanics, clinics, PMVs, and other essential services in your area.
                    </p>
                  </BlurCard>
                  
                  <BlurCard className="p-6">
                    <div className="mb-4 p-3 rounded-full bg-secondary/50 inline-flex">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Trusted Networks</h3>
                    <p className="text-muted-foreground">
                      Leverage wantok connections and community recommendations for reliable service providers.
                    </p>
                  </BlurCard>
                  
                  <BlurCard className="p-6">
                    <div className="mb-4 p-3 rounded-full bg-secondary/50 inline-flex">
                      <Star className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">AI Business Coach</h3>
                    <p className="text-muted-foreground">
                      Get practical guidance on business registration, loans, marketing, and growth strategies.
                    </p>
                  </BlurCard>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
        
        <section id="testimonials" className="py-16 bg-secondary/10 dark:bg-secondary/5">
          <div className="container max-w-6xl px-4 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">What Our Clients Say</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Trusted by businesses and individuals across Papua New Guinea.
              </p>
            </div>
            
            <div 
              ref={testimonialAnimation.ref}
              className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${testimonialAnimation.className}`}
            >
              {testimonials.map((testimonial, index) => (
                <BlurCard key={index} className="p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={cn(
                        "h-4 w-4", 
                        i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"
                      )} />
                    ))}
                  </div>
                  <blockquote className="mb-4 text-muted-foreground">"{testimonial.quote}"</blockquote>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.company}</div>
                  </div>
                </BlurCard>
              ))}
            </div>
          </div>
        </section>
        
        <Features />
        
        <section id="cta" className="py-16">
          <div className="container max-w-6xl px-4 mx-auto">
            <BlurCard className="p-8 text-center" variant="bordered">
              <h2 className="text-3xl font-bold mb-4">Ready to grow your business with Wantok.ai?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                Join thousands of businesses and individuals who trust Wantok.ai for business discovery and SME support across Papua New Guinea.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/signup" className={cn(buttonVariants({ size: "lg" }))}>
                  Find Services
                </Link>
                <Link to="/help" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                  List Your Business
                </Link>
              </div>
            </BlurCard>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
