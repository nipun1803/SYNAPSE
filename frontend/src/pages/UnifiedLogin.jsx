import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User, Mail, Lock, Eye, EyeOff, Loader2,
  Activity, CheckCircle2, ShieldCheck, Sparkles, HelpCircle, AlertCircle
} from "lucide-react";

import { AppContext } from "../context/AppContext";
import { authService } from "../api/services";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const ADMIN_URL = import.meta.env.VITE_ADMIN_URL;
const DOCTOR_URL = import.meta.env.VITE_DOCTOR_URL || ADMIN_URL;

const AuthSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password should be at least 6 chars"),
});

const UnifiedLogin = () => {
  const navigate = useNavigate();
  const { backendUrl, loadProfile } = useContext(AppContext);

  const [authMode, setAuthMode] = useState("login");
  const [userRole, setUserRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form setup
  const form = useForm({
    resolver: zodResolver(AuthSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  // Reset on mode change
  useEffect(() => {
    form.reset();
  }, [authMode, userRole]);

  const handleAuthSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      if (authMode === "signup" && userRole !== "user") {
        toast.error("Doctors and admins need to be invited by an admin.");
        return;
      }

      const payload = { ...values, userType: userRole };
      const data = authMode === "login"
        ? await authService.login(payload)
        : await authService.register(payload);

      if (!data.success) throw new Error(data.message || "Auth failed");

      toast.success(authMode === "login" ? "Welcome back!" : "Account created!");

      // Redirects
      if (authMode === "login") {
        if (data.userType === "admin") window.location.href = `${ADMIN_URL}/admin-dashboard`;
        else if (data.userType === "doctor") window.location.href = `${DOCTOR_URL}/doctor-dashboard`;
        else {
          if (loadProfile) await loadProfile();
          navigate("/");
        }
      } else {
        if (loadProfile) await loadProfile();
        navigate("/my-profile");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemo = () => {
    const demos = {
      user: { email: "test@gmail.com", password: "12345678" },
      doctor: { email: "testdoc@gmail.com", password: "doctor123" },
      admin: { email: "admin@gmail.com", password: "admin123" },
    };
    form.setValue("email", demos[userRole].email);
    form.setValue("password", demos[userRole].password);
    toast.info(`Filled ${userRole} demo creds`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4 font-sans text-slate-800">


      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-0 lg:gap-8 overflow-hidden rounded-3xl shadow-2xl bg-white border border-blue-100">


        <div className="hidden lg:flex flex-col relative text-white">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1551076805-e1869033e561?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80"
              alt="Medical Tech"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-700/90 to-blue-900/90 mix-blend-multiply" />
          </div>

          <div className="relative z-10 flex flex-col justify-between h-full p-12">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-inner">
                <Activity className="text-white h-6 w-6" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-white">Synapse</span>
            </div>

            <div className="space-y-8">
              <h2 className="text-4xl lg:text-5xl font-bold leading-[1.1]">
                Healthcare, <br />
                <span className="text-blue-200">Connected.</span>
              </h2>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl max-w-md shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <ShieldCheck className="text-blue-200 h-5 w-5" />
                  <span className="font-semibold text-sm">Bank-Grade Security</span>
                </div>
                <p className="text-sm text-blue-50 leading-relaxed font-light opacity-90">
                  Synapse protects your medical data with end-to-end encryption, ensuring your privacy is never compromised.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-blue-100 font-medium opacity-80">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> HIPAA Compliant</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> 24/7 Access</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center p-8 lg:p-16 bg-white relative">
          <div className="max-w-[400px] mx-auto w-full space-y-8">

            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {authMode === "login" ? "Welcome Back" : "Join Synapse"}
              </h1>
              <p className="text-sm text-slate-500">
                {authMode === "login"
                  ? "Sign in to access your portal."
                  : "Create an account to manage your health."}
              </p>
            </div>
            <Tabs value={userRole} onValueChange={setUserRole} className="w-full">
              <TabsList className="w-full grid grid-cols-3 bg-blue-50/80 p-1.5 rounded-xl h-12 border border-blue-100/50">
                <TabsTrigger value="user" className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all">Patient</TabsTrigger>
                <TabsTrigger value="doctor" className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all">Doctor</TabsTrigger>
                <TabsTrigger value="admin" className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all">Admin</TabsTrigger>
              </TabsList>
            </Tabs>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAuthSubmit)} className="space-y-4">

                {authMode === "signup" && (
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3.5 h-4 w-4 text-blue-400" />
                            <Input
                              placeholder="Full Name"
                              className="pl-10 h-11 border-blue-100 bg-blue-50/20 focus:bg-white focus:border-blue-400 rounded-xl"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3.5 h-4 w-4 text-blue-400" />
                          <Input
                            placeholder="Email Address"
                            className="pl-10 h-11 border-blue-100 bg-blue-50/20 focus:bg-white focus:border-blue-400 rounded-xl"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3.5 h-4 w-4 text-blue-400" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="pl-10 pr-10 h-11 border-blue-100 bg-blue-50/20 focus:bg-white focus:border-blue-400 rounded-xl"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3.5 text-blue-300 hover:text-blue-500 transition-colors"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all hover:-translate-y-0.5 mt-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : (authMode === "login" ? "Sign In" : "Create Account")}
                </Button>

              </form>
            </Form>


            {authMode === 'login' && (
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mt-4 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-blue-700 flex items-center gap-2">
                    <Sparkles size={14} className="text-blue-500" />
                    Demo Access
                  </p>
                  <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">Test Mode</span>
                </div>
                <Button
                  variant="outline"
                  onClick={fillDemo}
                  className="w-full h-9 bg-white border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 text-xs font-medium"
                >
                  Auto-Fill {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Credentials
                </Button>
              </div>
            )}

            <div className="text-center pt-2">
              <p className="text-sm text-slate-600">
                {authMode === "login" ? "New to Synapse?" : "Already have an account?"}{" "}
                <button
                  onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                  className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-all"
                >
                  {authMode === "login" ? "Create an account" : "Log in"}
                </button>
              </p>
            </div>

            <div className="mt-8 flex justify-center gap-6 text-[10px] text-slate-400">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLogin;