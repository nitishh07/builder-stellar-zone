import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Github } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Login-only state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup-only state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const { signIn, signUp, signInWithGithub } = useAuth();

  const hasMinLen = signupPassword.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(signupPassword);
  const hasNumber = /\d/.test(signupPassword);

  async function handleAuth(nextMode: "login" | "signup") {
    setError("");
    setSuccess("");

    if (nextMode === "login") {
      if (!loginEmail || !loginPassword) return setError("Please fill in all fields");
      try {
        await signIn(loginEmail, loginPassword);
        toast.success("Logged in");
        window.location.href = "/dashboard";
      } catch (e: any) {
        const raw = e?.message || "Authentication error";
        const msg = /user_not_found/i.test(e?.code || "") || /invalid login credentials/i.test(raw)
          ? "Account not found. Please create an account."
          : raw;
        setError(msg);
        toast.error(msg);
      }
      return;
    }

    // signup path
    if (!signupName.trim() || !signupEmail || !signupPassword) return setError("Please fill in all fields");
    if (!hasMinLen) return setError("Password must be at least 6 characters long");
    if (!hasLetter) return setError("Password must contain at least one letter");
    if (!hasNumber) return setError("Password must contain at least one number");

    try {
      await signUp(signupEmail, signupPassword, { role: "student", full_name: signupName.trim() });
      try {
        await signIn(signupEmail, signupPassword);
        window.location.href = "/dashboard";
      } catch {
        toast.success("Account created. Please verify your email, then log in.");
        setSuccess("Account created. Please verify your email, then log in.");
      }
    } catch (e: any) {
      const msg = e?.message || "Authentication error";
      setError(msg);
      toast.error(msg);
    }
  }

  async function handleGithub() {
    setError("");
    setSuccess("");
    try {
      await signInWithGithub();
    } catch (e: any) {
      const raw = e?.message || "GitHub auth error";
      const friendly = /provider is not enabled/i.test(raw)
        ? "Enable GitHub provider in Supabase (Auth → Providers) and configure the callback URL."
        : raw;
      setError(friendly);
      toast.error(friendly);
    }
  }

  function onTabChange(v: string) {
    setMode(v as any);
    setError("");
    setSuccess("");
    // Clear both forms when switching to avoid any pre-filled values
    setLoginEmail("");
    setLoginPassword("");
    setSignupName("");
    setSignupEmail("");
    setSignupPassword("");
  }

  return (
    <AppShell>
      <section className="relative mx-auto flex min-h-[calc(100vh-7rem)] max-w-7xl items-center justify-center overflow-hidden px-4 py-8 sm:px-6 lg:px-8" data-loc="client/pages/Auth.tsx:43:7">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(40rem_20rem_at_20%_0%,hsl(var(--brand-400)/.25),transparent),radial-gradient(40rem_20rem_at_80%_0%,hsl(var(--brand-500)/.20),transparent)]"
        />
        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2" data-loc="client/pages/Auth.tsx:48:9">
          <div className="order-2 lg:order-1">
            <Card className="mx-auto w-full max-w-md p-6 shadow-lg" data-loc="client/components/ui/card.tsx:9:3">
              <h1 className="mb-1 text-xl font-semibold" data-loc="client/pages/Auth.tsx:51:15">Welcome back</h1>
              <p className="mb-4 text-sm text-muted-foreground" data-loc="client/pages/Auth.tsx:52:15">
                Sign in to continue to Student Risk Monitoring & Counselling System
              </p>
              <Tabs value={mode} onValueChange={onTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2" data-loc="client/pages/Auth.tsx:55:15">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Signup</TabsTrigger>
                </TabsList>
                <TabsContent value="login" data-loc="client/components/ui/tabs.tsx:42:3">
                  <form
                    className="mt-4 space-y-4"
                    autoComplete="off"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAuth("login");
                    }}
                    data-loc="client/pages/Auth.tsx:103:19"
                  >
                    <div className="space-y-2" data-loc="client/pages/Auth.tsx:110:21">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        placeholder="you@school.edu"
                        data-loc="client/components/ui/input.tsx:8:7"
                        autoComplete="off"
                      />
                    </div>
                    <div className="space-y-2" data-loc="client/pages/Auth.tsx:114:21">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        autoComplete="off"
                      />
                    </div>
                    {error && (
                      <div className="rounded-md border border-red-200 bg-red-50 p-3">
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    )}
                    {success && (
                      <div className="rounded-md border border-green-200 bg-green-50 p-3">
                        <p className="text-sm text-green-800">{success}</p>
                      </div>
                    )}
                    <Button type="submit" className="w-full">
                      Continue
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGithub}
                    >
                      <Github className="mr-2 size-4" /> Continue with GitHub
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="signup">
                  <form
                    className="mt-4 space-y-4"
                    autoComplete="off"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAuth("signup");
                    }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        required
                        placeholder="Your full name"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        required
                        placeholder="you@school.edu"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        autoComplete="off"
                      />
                      {signupPassword.length > 0 && (
                        <div className="mt-1 text-xs space-y-1">
                          <div className={hasMinLen ? "text-green-600" : "text-red-600"}>
                            ✓ At least 6 characters ({signupPassword.length}/6)
                          </div>
                          <div className={hasLetter ? "text-green-600" : "text-red-600"}>✓ Contains letters</div>
                          <div className={hasNumber ? "text-green-600" : "text-red-600"}>✓ Contains numbers</div>
                        </div>
                      )}
                    </div>
                    {error && (
                      <div className="rounded-md border border-red-200 bg-red-50 p-3">
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    )}
                    {success && (
                      <div className="rounded-md border border-green-200 bg-green-50 p-3">
                        <p className="text-sm text-green-800">{success}</p>
                      </div>
                    )}
                    <Button type="submit" className="w-full">
                      Create account
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGithub}
                    >
                      <Github className="mr-2 size-4" /> Sign up with GitHub
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
          <div className="order-1 flex flex-col justify-center lg:order-2">
            <div className="mx-auto max-w-xl text-center lg:text-left" data-loc="client/pages/Auth.tsx:134:11">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                Modern • Clean • Educator-friendly
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Student Risk Monitoring & Counselling System
              </h2>
              <p className="mt-3 text-muted-foreground">
                A mentor-first dashboard that surfaces at-risk students using clear color-coded signals
                and explains why, so you can act fast.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-center">
                <Button asChild>
                  <a href="/dashboard">Go to Dashboard</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/notifications">View Notifications</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
