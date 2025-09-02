
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BlurCard } from '@/components/ui/blur-card';
import { useScrollAnimation } from '@/lib/animations';
import { Shield, FileText, MessageSquare } from 'lucide-react';

interface HeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
}

const Hero = ({
  title = "Professional services simplified for Papua New Guinea",
  subtitle = "AI-powered business discovery, SME support, and community connections designed for Papua New Guinea and the Pacific.",
  ctaText = "Get Started",
  ctaLink = "/signup",
  secondaryCtaText = "Explore Services",
  secondaryCtaLink = "#services"
}: HeroProps) => {
  const titleAnimation = useScrollAnimation({
    initialClass: 'opacity-0 translate-y-4',
    animateClass: 'opacity-100 translate-y-0 transition-all duration-700 ease-out',
  });

  const subtitleAnimation = useScrollAnimation({
    initialClass: 'opacity-0',
    animateClass: 'opacity-100 transition-all duration-700 delay-300 ease-out',
    delay: 300,
  });

  const cardAnimation = useScrollAnimation({
    initialClass: 'opacity-0 scale-95',
    animateClass: 'opacity-100 scale-100 transition-all duration-700 delay-500 ease-out',
    delay: 500,
  });

  return (
    <section className="relative pt-16 pb-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background/80 dark:from-background/50 dark:to-background pointer-events-none" />
      
      {/* Blurred circles */}
      <div className="absolute top-20 right-[20%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-40 left-[10%] w-[400px] h-[400px] bg-png-yellow/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container px-4 mx-auto max-w-6xl z-10 relative pt-12 pb-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 
            ref={titleAnimation.ref}
            className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight ${titleAnimation.className}`}
          >
            {title}
          </h1>
          <p
            ref={subtitleAnimation.ref} 
            className={`text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8 ${subtitleAnimation.className}`}
          >
            {subtitle}
          </p>
          
          <div className={`flex flex-col sm:flex-row justify-center gap-4 mb-12 ${subtitleAnimation.className}`}>
            <Link to={ctaLink}>
              <Button size="lg" className="shadow-md">
                {ctaText}
              </Button>
            </Link>
            <Link to={secondaryCtaLink}>
              <Button size="lg" variant="outline" className="shadow-sm">
                {secondaryCtaText}
              </Button>
            </Link>
          </div>
        </div>
        
        <div 
          ref={cardAnimation.ref}
          className={`${cardAnimation.className}`}
        >
          <BlurCard className="p-6 sm:p-8 max-w-4xl mx-auto" variant="bordered" hoverable>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureHighlight 
                icon={<Shield className="h-8 w-8 text-primary" />} 
                title="Trusted Business Network" 
                description="Connect with verified businesses and trusted service providers across PNG" 
              />
              <FeatureHighlight 
                icon={<FileText className="h-8 w-8 text-primary" />} 
                title="Smart Business Search" 
                description="AI-powered discovery to find the right services, suppliers, and partners" 
              />
              <FeatureHighlight 
                icon={<MessageSquare className="h-8 w-8 text-primary" />} 
                title="AI Business Coach" 
                description="Get practical guidance on business growth, compliance, and funding" 
              />
            </div>
          </BlurCard>
        </div>
      </div>
    </section>
  );
};

interface FeatureHighlightProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureHighlight = ({ icon, title, description }: FeatureHighlightProps) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 p-3 rounded-full bg-secondary/50">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default Hero;
