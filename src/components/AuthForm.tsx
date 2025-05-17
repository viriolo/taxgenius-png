
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BlurCard } from "@/components/ui/blur-card";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole, BusinessType } from "@/models/User";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type AuthMode = "login" | "signup";

interface AuthFormProps {
  mode: AuthMode;
}

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  rememberMe: z.boolean().optional(),
});

const signupSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .refine(
      password => /[A-Z]/.test(password) && 
                 /[a-z]/.test(password) && 
                 /[0-9]/.test(password) && 
                 /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      { message: "Password must include uppercase, lowercase, number and special character" }
    ),
  confirmPassword: z.string(),
  businessName: z.string().optional(),
  tinNumber: z.string()
    .regex(/^\d{9,10}$/, { message: "TIN Number must be 9-10 digits" })
    .optional(),
  businessType: z.nativeEnum(BusinessType).optional(),
  role: z.nativeEnum(UserRole).default(UserRole.BUSINESS),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const AuthForm = ({ mode }: AuthFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or default to dashboard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });
  
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      businessName: "",
      tinNumber: "",
      businessType: undefined,
      role: UserRole.BUSINESS,
    },
  });

  const handleLoginSubmit = async (values: LoginFormValues) => {
    try {
      await login({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });
      navigate(from, { replace: true });
    } catch (error) {
      // Error handling is done in the auth context
    }
  };

  const handleSignupSubmit = async (values: SignupFormValues) => {
    try {
      await register({
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        businessName: values.businessName,
        tinNumber: values.tinNumber,
        businessType: values.businessType,
        role: values.role,
      });
      navigate('/dashboard');
    } catch (error) {
      // Error handling is done in the auth context
    }
  };

  return (
    <BlurCard className="w-full max-w-md p-8" variant="bordered">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">
          {mode === "login" ? "Welcome Back" : "Create Your Account"}
        </h2>
        <p className="text-foreground/70 text-sm">
          {mode === "login" 
            ? "Enter your credentials to access your account" 
            : "Complete the form below to create your business account"}
        </p>
      </div>

      {mode === "login" ? (
        <Form {...loginForm}>
          <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
            <FormField
              control={loginForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50" />
                    <FormControl>
                      <Input
                        placeholder="your@email.com"
                        className="pl-10"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={loginForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50" />
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-foreground/50" />
                      ) : (
                        <Eye className="h-4 w-4 text-foreground/50" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={loginForm.control}
              name="rememberMe"
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={field.value}
                    onChange={field.onChange}
                    className="rounded border-gray-300 text-png-red focus:ring-png-red"
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-foreground/70">
                    Remember me for 30 days
                  </Label>
                </div>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-png-red hover:bg-png-red/90 mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span>Sign In</span>
              )}
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...signupForm}>
          <form onSubmit={signupForm.handleSubmit(handleSignupSubmit)} className="space-y-4">
            <FormField
              control={signupForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50" />
                    <FormControl>
                      <Input
                        placeholder="your@email.com"
                        className="pl-10"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={signupForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50" />
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-foreground/50" />
                      ) : (
                        <Eye className="h-4 w-4 text-foreground/50" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={signupForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50" />
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={signupForm.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your Business Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={signupForm.control}
              name="tinNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TIN Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="PNG Tax Identification Number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={signupForm.control}
              name="businessType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(BusinessType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-png-red hover:bg-png-red/90 mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                <span>Create Account</span>
              )}
            </Button>
          </form>
        </Form>
      )}

      {mode === "signup" && (
        <div className="mt-6 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-png-red mt-0.5 flex-shrink-0" />
            <span className="text-foreground/80">
              Compliant with PNG data protection regulations
            </span>
          </div>
        </div>
      )}

      <div className="mt-6 text-center text-sm text-foreground/70">
        {mode === "login" ? (
          <>
            Don't have an account?{" "}
            <a href="/signup" className="font-medium text-png-red hover:underline">
              Sign up
            </a>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <a href="/login" className="font-medium text-png-red hover:underline">
              Sign in
            </a>
          </>
        )}
      </div>
    </BlurCard>
  );
};

export default AuthForm;
