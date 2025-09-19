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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { signIn, signUp, signInWithGithub } = useAuth();

  const hasMinLen = password.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  async function handleAuth(nextMode: "login" | "signup") {
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (nextMode === "signup") {
      if (!hasMinLen) return setError("Password must be at least 6 characters long");
      if (!hasLetter) return setError("Password must contain at least one letter");
      if (!hasNumber) return setError("Password must contain at least one number");
    }

    try {
      if (nextMode === "login") {
        await signIn(email, password);
        toast.success("Logged in");
        window.location.href = "/dashboard";
      } else {
        const result = await signUp(email, password, { role: "student" });
        // If signup didn't create a session (email confirmation), try immediate login
        try {
          await signIn(email, password);
          window.location.href = "/dashboard";
        } catch (err) {
          toast.success("Account created. Please verify your email, then log in.");
          setSuccess("Account created. Please verify your email, then log in.");
        }
      }
    } catch (e: any) {
      const raw = e?.message || "Authentication error";
      const msg = /user_not_found/i.test(e?.code || "") || /invalid login credentials/i.test(raw)
        ? "Account not found. Please create an account."
        : raw;
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
      const msg = e?.message || "GitHub auth error";
      setError(msg);
      toast.error(msg);
    }
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
              <Tabs value={mode} onValueChange={(v) => { setMode(v as any); setError(""); setSuccess(""); }} className="w-full">
                <TabsList className="grid w-full grid-cols-2" data-loc="client/pages/Auth.tsx:55:15">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Signup</TabsTrigger>
                </TabsList>
                <TabsContent value="login" data-loc="client/components/ui/tabs.tsx:42:3">
                  <form
                    className="mt-4 space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAuth("login");
                    }}
                    data-loc="client/pages/Auth.tsx:103:19"
                  >
                    <div className="space-y-2" data-loc="client/pages/Auth.tsx:110:21">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@school.edu"
                        data-loc="client/components/ui/input.tsx:8:7"
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-2" data-loc="client/pages/Auth.tsx:114:21">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
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
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAuth("signup");
                    }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email2">Email</Label>
                      <Input
                        id="email2"
                        type="email"
                        required
                        placeholder="you@school.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password2">Password</Label>
                      <Input
                        id="password2"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                      {password.length > 0 && (
                        <div className="mt-1 text-xs space-y-1">
                          <div className={hasMinLen ? "text-green-600" : "text-red-600"}>
                            ✓ At least 6 characters ({password.length}/6)
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
