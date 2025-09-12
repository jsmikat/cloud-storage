"use client";

import { useUser } from "@clerk/nextjs";
import {
    AlertTriangle,
    Lock,
    Mail,
    Trash2
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { ErrorAlert } from "./ui/error-alert";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LoadingSpinner } from "./ui/loading-spinner";
import { PasswordToggle } from "./ui/password-toggle";

interface ProfileSectionProps {
  userName: string;
}

export default function ProfileSection({ userName }: ProfileSectionProps) {
  const { user } = useUser();
  const router = useRouter();

  // Profile management states
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Email update states
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState("");

  // Password update states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Delete account states
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Email update functionality
  const handleEmailUpdate = async () => {
    if (!user || !newEmail.trim()) return;

    setEmailLoading(true);
    setEmailError(null);

    try {
      // Create a new email address
      const emailAddress = await user.createEmailAddress({ email: newEmail });

      // Prepare verification
      await emailAddress.prepareVerification({ strategy: "email_code" });

      setVerifyingEmail(true);
      toast.info("Verification code sent to your new email address");
    } catch (error: any) {
      console.error("Email update error:", error);
      setEmailError(error.errors?.[0]?.message || "Failed to update email");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleEmailVerification = async () => {
    if (!user || !emailVerificationCode.trim()) return;

    setEmailLoading(true);
    setEmailError(null);

    try {
      // Find the email address that needs verification
      const emailAddress = user.emailAddresses.find(
        (email) => email.emailAddress === newEmail
      );

      if (!emailAddress) {
        throw new Error("Email address not found");
      }

      // Attempt verification
      await emailAddress.attemptVerification({ code: emailVerificationCode });

      // Set as primary email
      await user.update({
        primaryEmailAddressId: emailAddress.id,
      });

      toast.success("Email updated successfully!");
      setEmailModalOpen(false);
      setNewEmail("");
      setEmailVerificationCode("");
      setVerifyingEmail(false);
    } catch (error: any) {
      console.error("Email verification error:", error);
      setEmailError(error.errors?.[0]?.message || "Failed to verify email");
    } finally {
      setEmailLoading(false);
    }
  };

  // Password update functionality
  const handlePasswordUpdate = async () => {
    if (!user || !currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    setPasswordLoading(true);
    setPasswordError(null);

    try {
      await user.updatePassword({
        currentPassword,
        newPassword,
      });

      toast.success("Password updated successfully!");
      setPasswordModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Password update error:", error);
      setPasswordError(error.errors?.[0]?.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Account deletion functionality
  const handleAccountDeletion = async () => {
    if (!user || deleteConfirmation !== "DELETE") {
      setDeleteError("Please type 'DELETE' to confirm");
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await user.delete();
      toast.success("Account deleted successfully");
      router.push("/");
    } catch (error: any) {
      console.error("Account deletion error:", error);
      setDeleteError(error.errors?.[0]?.message || "Failed to delete account");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Reset modal states
  const resetEmailModal = () => {
    setNewEmail("");
    setEmailVerificationCode("");
    setEmailError(null);
    setVerifyingEmail(false);
    setEmailModalOpen(false);
  };

  const resetPasswordModal = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError(null);
    setPasswordModalOpen(false);
  };

  const resetDeleteModal = () => {
    setDeleteConfirmation("");
    setDeleteError(null);
    setDeleteModalOpen(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <h2 className="text-2xl font-semibold">Profile Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Username
              </label>
              <p className="text-sm text-gray-900 p-2">{userName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-sm text-gray-900 p-2">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-3">Account Actions</h3>
            <div className="space-y-3">
              {/* Update Email Button */}
              <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Update Email
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Email Address</DialogTitle>
                    <DialogDescription>
                      {verifyingEmail
                        ? "Enter the verification code sent to your new email"
                        : "Enter your new email address"}
                    </DialogDescription>
                  </DialogHeader>

                  {emailError && <ErrorAlert error={emailError} />}

                  {!verifyingEmail ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="newEmail">New Email Address</Label>
                        <Input
                          id="newEmail"
                          type="email"
                          placeholder="Enter new email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          disabled={emailLoading}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="verificationCode">
                          Verification Code
                        </Label>
                        <Input
                          id="verificationCode"
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={emailVerificationCode}
                          onChange={(e) => setEmailVerificationCode(e.target.value)}
                          disabled={emailLoading}
                          maxLength={6}
                        />
                      </div>
                    </div>
                  )}

                  <DialogFooter>
                    <Button variant="outline" onClick={resetEmailModal}>
                      Cancel
                    </Button>
                    {!verifyingEmail ? (
                      <Button
                        onClick={handleEmailUpdate}
                        disabled={emailLoading || !newEmail.trim()}
                      >
                        {emailLoading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          "Send Verification Code"
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleEmailVerification}
                        disabled={
                          emailLoading || !emailVerificationCode.trim()
                        }
                      >
                        {emailLoading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          "Verify & Update"
                        )}
                      </Button>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Change Password Button */}
              <Dialog
                open={passwordModalOpen}
                onOpenChange={setPasswordModalOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      Enter your current password and choose a new one
                    </DialogDescription>
                  </DialogHeader>

                  {passwordError && <ErrorAlert error={passwordError} />}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Enter current password"
                          value={currentPassword}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                          disabled={passwordLoading}
                          className="pr-10"
                        />
                        <PasswordToggle
                          show={showCurrentPassword}
                          onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                          disabled={passwordLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                          disabled={passwordLoading}
                          className="pr-10"
                        />
                        <PasswordToggle
                          show={showNewPassword}
                          onToggle={() => setShowNewPassword(!showNewPassword)}
                          disabled={passwordLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                          disabled={passwordLoading}
                          className="pr-10"
                        />
                        <PasswordToggle
                          show={showConfirmPassword}
                          onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={passwordLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={resetPasswordModal}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handlePasswordUpdate}
                      disabled={
                        passwordLoading ||
                        !currentPassword ||
                        !newPassword ||
                        !confirmPassword
                      }
                    >
                      {passwordLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Delete Account Button */}
              <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      Delete Account
                    </DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove all your data from our servers.
                    </DialogDescription>
                  </DialogHeader>

                  {deleteError && <ErrorAlert error={deleteError} />}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="deleteConfirmation">
                        Type "DELETE" to confirm
                      </Label>
                      <Input
                        id="deleteConfirmation"
                        type="text"
                        placeholder="DELETE"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        disabled={deleteLoading}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={resetDeleteModal}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleAccountDeletion}
                      disabled={
                        deleteLoading || deleteConfirmation !== "DELETE"
                      }
                    >
                      {deleteLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        "Delete Account"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}