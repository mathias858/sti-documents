import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Lock, Mail, GitBranch } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid official email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { login: setAuthToken, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLogin();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  if (isAuthenticated) {
    return <Redirect href="/" />;
  }

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate({ data }, {
      onSuccess: (res) => {
        setAuthToken(res.token);
        toast({
          title: "Authentication Successful",
          description: "Welcome to Ministry Flow.",
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: "Invalid credentials. Please verify your official email and password.",
        });
      }
    });
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Left Side: Modern Presentation Section */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between relative bg-slate-900 text-white overflow-hidden p-12 xl:p-16 shadow-[0_0_60px_-15px_rgba(0,0,0,0.5)] z-10">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/auth-bg.png`} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-15 mix-blend-soft-light scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/90 to-primary/20" />
          
          {/* Decorative Accents */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/15 rounded-full blur-[120px]" />
        </div>
        
        <div className="z-10 flex flex-col h-full justify-between py-4">
          <div className="space-y-10">
            {/* Logo - Designed with subtle accents instead of a box */}
            <div className="flex items-center gap-6 animate-in fade-in slide-in-from-left-4 duration-1000">
              <div className="relative group">
                <div className="absolute -inset-4 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500" />
                <img 
                  src={`${import.meta.env.BASE_URL}logo.jpg`} 
                  alt="Logo" 
                  className="h-20 lg:h-24 object-contain relative z-10 transition-transform duration-500 group-hover:scale-105" 
                />
              </div>
              <div className="h-12 w-px bg-white/10 mx-2 hidden xl:block" />
              <div className="hidden xl:block">
                <p className="text-xs font-bold tracking-[0.3em] text-amber-500/80 uppercase">EDRMS</p>
                <p className="text-[10px] text-slate-400 font-medium tracking-wider">SECURE PORTAL</p>
              </div>
            </div>

            <div className="space-y-6 max-w-xl">
              <div className="space-y-4">
                <Badge variant="outline" className="text-amber-400 border-amber-400/20 bg-amber-400/5 px-3 py-1 text-[9px] tracking-[0.2em] font-bold rounded-full">
                  OFFICIAL GOVERNMENT PORTAL
                </Badge>
                <h1 className="text-4xl xl:text-5xl font-serif font-extrabold leading-[1.15] tracking-tight text-white">
                  Transforming <br/> <span className="text-amber-400 italic font-serif">Governance</span> Through Innovation.
                </h1>
              </div>

              <p className="text-lg text-slate-300/80 font-light leading-relaxed max-w-md">
                Streamlining document lifecycles for Rwanda's scientific and technological advancement.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                  <span className="font-semibold text-white/90 text-xs">High Security</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <GitBranch className="w-5 h-5 text-amber-500 shrink-0" />
                  <span className="font-semibold text-white/90 text-xs">Fluid Workflow</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-10">
              <div className="space-y-1">
                <p className="text-2xl font-bold font-mono text-white">100%</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Paperless</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="space-y-1">
                <p className="text-2xl font-bold font-mono text-white">ISO</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Standard</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="space-y-1">
                <p className="text-2xl font-bold font-mono text-white">24/7</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Reliable</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                <Lock className="w-4 h-4 text-slate-900" />
              </div>
              <p className="text-[11px] text-slate-400">
                <span className="text-white font-bold mr-1">Advanced Protection:</span>
                Session secured by encryption.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 z-0">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="lg:hidden flex items-center justify-center mb-8">
            <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="Logo" className="w-32 object-contain" />
          </div>

          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome Back</h2>
            <p className="text-slate-500">Sign in to your official EDRMS account to continue.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 relative overflow-hidden group">
            {/* Subtle light effect on the form */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-semibold text-xs uppercase tracking-wider">Official Email</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-slate-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="official@ministry.gov"
                    className="pl-12 h-14 bg-slate-50/50 border-slate-200 transition-all focus:bg-white focus:ring-primary/20 rounded-2xl text-base shadow-inner"
                    {...register("email")}
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive mt-1 flex items-center"><span className="inline-block w-1 h-1 bg-destructive rounded-full mr-2"></span>{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-700 font-semibold text-xs uppercase tracking-wider">Password</Label>
                  <a href="#" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">Forgot password?</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-slate-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••"
                    className="pl-12 h-14 bg-slate-50/50 border-slate-200 transition-all focus:bg-white focus:ring-primary/20 rounded-2xl text-base shadow-inner tracking-widest"
                    {...register("password")}
                  />
                </div>
                {errors.password && <p className="text-xs text-destructive mt-1 flex items-center"><span className="inline-block w-1 h-1 bg-destructive rounded-full mr-2"></span>{errors.password.message}</p>}
              </div>

              <Button 
                type="submit" 
                disabled={loginMutation.isPending}
                className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-lg shadow-slate-900/20 transition-all transform hover:-translate-y-0.5 mt-8 font-bold text-base flex items-center justify-center space-x-2"
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    <span>Secure Access</span>
                    <ShieldCheck className="w-5 h-5 ml-2 opacity-80" />
                  </>
                )}
              </Button>
            </form>
          </div>
          
          <p className="text-center text-xs text-slate-400 mt-8">
            Warning: The use of this system is restricted to authorized personnel. <br/> Access is heavily monitored.
          </p>
        </div>
      </div>
    </div>
  );
}
