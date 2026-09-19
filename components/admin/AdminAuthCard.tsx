"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Spinner,
  Tabs,
} from "@heroui/react";
import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.email("Enter a valid email."),
  username: z.string().min(3, "Minimum 3 characters."),
  password: z.string().min(6, "Minimum 6 characters."),
});

const loginSchema = z.object({
  username: z.string().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

export default function AdminAuthCard() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
    },
  });

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onRegister = async (data: RegisterInput) => {
    setLoading(true);

    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Registration failed.");
        return;
      }

      toast.success("Admin account created successfully.");

      registerForm.reset();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async (data: LoginInput) => {
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Login failed.");
        return;
      }

      toast.success(`Welcome ${result.admin.name}!`);

      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-xl shadow-xl border-0">
      <CardHeader className="flex flex-col items-center gap-2 border-b p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white">
          <ShieldCheck size={28} />
        </div>

        <CardTitle className="text-2xl font-bold">Sports Meet 2026</CardTitle>

        <CardDescription>Administrator Access</CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <div className="mb-6 flex justify-center">
          <Tabs className="w-full max-w-md">
            <Tabs.ListContainer>
              <Tabs.List aria-label="Options">
                <Tabs.Tab id="login">
                  Sign In
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="register">
                  Sign Up
                  <Tabs.Indicator />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>
            <Tabs.Panel className="pt-4" id="login">
              <form
                onSubmit={loginForm.handleSubmit(onLogin)}
                className="space-y-4"
              >
                <div className="flex flex-col gap-1">
                  <Label>Username</Label>

                  <Input
                    placeholder="Enter your username"
                    {...loginForm.register("username")}
                  />

                  {loginForm.formState.errors.username && (
                    <p className="text-danger text-sm">
                      {loginForm.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <Label>Password</Label>

                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...loginForm.register("password")}
                  />

                  {loginForm.formState.errors.password && (
                    <p className="text-danger text-sm">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <ButtonGroup>
                  <Button type="submit" variant="primary" className="w-full">
                    Login
                  </Button>
                  {loading && (
                    <Button isIconOnly aria-label="More options">
                      <ButtonGroup.Separator />
                      <Spinner size="md" className="text-white p-1" />
                    </Button>
                  )}
                </ButtonGroup>
              </form>
            </Tabs.Panel>
            <Tabs.Panel className="pt-4" id="register">
              <form
                onSubmit={registerForm.handleSubmit(onRegister)}
                className="space-y-4"
              >
                <div className="flex flex-col gap-1">
                  <Label>Name</Label>

                  <Input
                    placeholder="Enter your name"
                    {...registerForm.register("name")}
                  />

                  {registerForm.formState.errors.name && (
                    <p className="text-danger text-sm">
                      {registerForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <Label>Email</Label>

                  <Input
                    type="email"
                    placeholder="Enter your email"
                    {...registerForm.register("email")}
                  />

                  {registerForm.formState.errors.email && (
                    <p className="text-danger text-sm">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <Label>Username</Label>

                  <Input
                    placeholder="Choose a username"
                    {...registerForm.register("username")}
                  />

                  {registerForm.formState.errors.username && (
                    <p className="text-danger text-sm">
                      {registerForm.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <Label>Password</Label>

                  <Input
                    type="password"
                    placeholder="Create a password"
                    {...registerForm.register("password")}
                  />

                  {registerForm.formState.errors.password && (
                    <p className="text-danger text-sm">
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <ButtonGroup>
                  <Button type="submit" variant="primary" className="w-full">
                    Create Admin Account
                  </Button>
                  {loading && (
                    <Button isIconOnly aria-label="More options">
                      <ButtonGroup.Separator />
                      <Spinner size="md" className="text-white p-1" />
                    </Button>
                  )}
                </ButtonGroup>
              </form>
            </Tabs.Panel>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
