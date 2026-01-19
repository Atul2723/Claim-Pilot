import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ShieldCheck, Globe } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="font-display font-bold text-2xl text-slate-900">Expensify</div>
          <Button onClick={handleLogin}>Log In with Replit</Button>
        </div>
      </nav>

      {/* Hero */}
      <main className="pt-32 pb-16 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-slate-900 tracking-tight mb-8 animate-in">
            Expense management for <span className="text-blue-600">modern teams</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto animate-in" style={{ animationDelay: "100ms" }}>
            Streamline your company expenses with powerful approval workflows, 
            receipt tracking, and client billing separation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in" style={{ animationDelay: "200ms" }}>
            <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-lg" onClick={handleLogin}>
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 animate-in" style={{ animationDelay: "300ms" }}>
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Easy Approvals</h3>
            <p className="text-slate-600">Multi-stage approval workflow from managers to finance teams.</p>
          </div>
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Secure & Compliant</h3>
            <p className="text-slate-600">Enterprise-grade security for your financial data and receipts.</p>
          </div>
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
            <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-6">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Client Billable</h3>
            <p className="text-slate-600">Easily separate internal costs from client-billable expenses.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
