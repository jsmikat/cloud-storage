"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { ArrowRight, Loader2, LogOut, Mail, Shield, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Separator } from "./ui/separator";

export default function UserProfile() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="flex flex-col justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <Card className="max-w-md mx-auto border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center gap-3">
          <User className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">User Profile</h2>
        </CardHeader>
        <Separator />
        <CardContent className="text-center py-10">
          <div className="mb-6">
            <Avatar className="mx-auto mb-4 h-16 w-16">
              <AvatarFallback>G</AvatarFallback>
            </Avatar>
            <p className="text-lg font-medium">Not Signed In</p>
            <p className="text-muted-foreground mt-2">
              Please sign in to access your profile
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => router.push("/sign-in")}
            className="px-8"
          >
            Sign In
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  const email = user.primaryEmailAddress?.emailAddress || "";
  const initials = fullName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  const userRole = user.publicMetadata.role as string | undefined;

  const handleSignOut = () => {
    signOut(() => {
      router.push("/");
    });
  };

  return (
    <Card className="max-w-md mx-auto border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center gap-3">
        <User className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold">User Profile</h2>
      </CardHeader>
      <Separator />
      <CardContent className="py-6">
        <div className="flex flex-col items-center text-center mb-6">
          <Avatar className="mb-4 h-24 w-24">
            {user.imageUrl ? (
              <AvatarImage src={user.imageUrl} alt={fullName} />
            ) : (
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            )}
          </Avatar>
          <h3 className="text-xl font-semibold">{fullName}</h3>
          {user.emailAddresses && user.emailAddresses.length > 0 && (
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{email}</span>
            </div>
          )}
          {userRole && (
            <Badge
              variant="secondary"
              className="mt-3"
            >
              {userRole}
            </Badge>
          )}
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600/70" />
              <span className="font-medium">Account Status</span>
            </div>
            <Badge
              variant="default"
              className="bg-green-100 text-green-800 hover:bg-green-100"
            >
              Active
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600/70" />
              <span className="font-medium">Email Verification</span>
            </div>
            <Badge
              variant={
                user.emailAddresses?.[0]?.verification?.status === "verified"
                  ? "default"
                  : "secondary"
              }
              className={
                user.emailAddresses?.[0]?.verification?.status === "verified"
                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                  : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
              }
            >
              {user.emailAddresses?.[0]?.verification?.status === "verified"
                ? "Verified"
                : "Pending"}
            </Badge>
          </div>
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </CardFooter>
    </Card>
  );
}