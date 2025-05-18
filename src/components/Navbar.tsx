
import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "@/components/ui/theme-provider";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Menu, Bot } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const mainNavItems = [
    { name: "Dashboard", path: "/dashboard" },
    { 
      name: "Services", 
      items: [
        { name: "PNG Tax Calculator", path: "/income-tax-calculator", description: "Calculate your PNG Income Tax" },
        { name: "Legal Services", path: "/legal-services", description: "Get professional legal advice" },
        { name: "Service Chat Assistant", path: "/chat-assistant", description: "Find and chat with PNG service providers" },
      ] 
    },
    { name: "Reports", path: "/reports" },
    { name: "Help", path: "/help" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link to="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold text-xl text-primary">wantok.ai</span>
          </Link>
          
          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {mainNavItems.map((item, index) => {
                // Handle dropdown items
                if (item.items) {
                  return (
                    <NavigationMenuItem key={index}>
                      <NavigationMenuTrigger className={cn(
                        "text-muted-foreground",
                        item.items.some(subItem => isActive(subItem.path)) && "text-foreground"
                      )}>
                        {item.name}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                          {item.items.map((subItem, subIndex) => (
                            <li key={subIndex} className="row-span-1">
                              <NavigationMenuLink asChild>
                                <Link
                                  to={subItem.path}
                                  className={cn(
                                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                    isActive(subItem.path) && "bg-accent text-accent-foreground"
                                  )}
                                >
                                  <div className="text-sm font-medium leading-none">{subItem.name}</div>
                                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                    {subItem.description}
                                  </p>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  )
                }
                
                // Handle regular items
                return (
                  <NavigationMenuItem key={index}>
                    <NavigationMenuLink asChild>
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center text-sm font-medium transition-colors hover:text-foreground",
                          isActive(item.path) 
                            ? "text-foreground" 
                            : "text-muted-foreground"
                        )}
                      >
                        {item.name}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* Chat Assistant Link */}
          <Link
            to="/chat-assistant"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "hidden md:flex items-center gap-1"
            )}
          >
            <Bot className="h-4 w-4" />
            Chat Assistant
          </Link>
          
          {/* Theme toggle */}
          <ThemeToggle />
          
          {/* Mobile Menu Trigger */}
          {isMobile && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[270px] sm:w-[350px]">
                <Link to="/" className="flex items-center space-x-2 mb-6">
                  <span className="inline-block font-bold text-xl">wantok.ai</span>
                </Link>
                <nav className="flex flex-col gap-5 pt-2">
                  {/* Add Chat Assistant to mobile menu */}
                  <Link
                    to="/chat-assistant"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "text-sm font-medium flex items-center gap-2",
                      isActive("/chat-assistant")
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Bot className="h-4 w-4" />
                    Chat Assistant
                  </Link>
                  
                  {/* Main mobile items */}
                  {mainNavItems.map((item, index) => {
                    if (item.items) {
                      return (
                        <div key={index} className="space-y-3">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <div className="grid gap-2 pl-3">
                            {item.items.map((subItem, subIndex) => (
                              <Link
                                key={subIndex}
                                to={subItem.path}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                  "block text-sm transition-colors",
                                  isActive(subItem.path)
                                    ? "text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                )}
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    
                    return (
                      <Link
                        key={index}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "text-sm transition-colors",
                          isActive(item.path)
                            ? "text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {item.name}
                      </Link>
                    )
                  })}
                  <div className="h-px bg-border my-2" />
                  {/* Auth links for mobile */}
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="text-sm font-medium"
                  >
                    Get Started
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          )}

          {/* Auth Links */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link
              to="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "px-4"
              )}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className={cn(
                buttonVariants({ size: "sm" }),
                "px-4"
              )}
            >
              Get Started
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
