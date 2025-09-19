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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signIn, signUp, signInWithGithub } = useAuth();

  async function handleAuth(mode: "login" | "signup") {
    try {
      if (mode === "login") {
        await signIn(email, password);
        toast.success("Logged in");
        window.location.href = "/dashboard";
      } else {
        await signUp(email, password, { role: "mentor" });
        toast.success("Signup successful. Check your email to verify.");
      }
    } catch (e: any) {
      toast.error(e?.message || "Auth error");
    }
  }

  async function handleGithub() {
    try {
      await signInWithGithub();
    } catch (e: any) {
      toast.error(e?.message || "GitHub auth error");
    }
  }

  return (
    <AppShell>
      <section className="relative mx-auto flex min-h-[calc(100vh-7rem)] max-w-7xl items-center justify-center overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(40rem_20rem_at_20%_0%,hsl(var(--brand-400)/.25),transparent),radial-gradient(40rem_20rem_at_80%_0%,hsl(var(--brand-500)/.20),transparent)]"
        />
        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <Card className="mx-auto w-full max-w-md p-6 shadow-lg">
              <h1 className="mb-1 text-xl font-semibold">Welcome back</h1>
              <p className="mb-4 text-sm text-muted-foreground">
                Sign in to continue to Student Risk Monitoring & Counselling System
              </p>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Signup</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <form
                    className="mt-4 space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAuth("login");
                    }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@school.edu"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
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
                      <Input id="email2" type="email" required placeholder="you@school.edu" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password2">Password</Label>
                      <Input id="password2" type="password" required />
                    </div>
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
            <div className="mx-auto max-w-xl text-center lg:text-left">
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
