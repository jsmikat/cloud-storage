"use client";

import FileList from "@/components/FileList";
import FileUploadForm from "@/components/FileUploadForm";
import { useUser } from "@clerk/nextjs";
import {
  AlertTriangle,
  FileText,
  FileUp,
  Home,
  Lock,
  Mail,
  Trash2
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
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

interface DashboardContentProps {
  userId: string;
  userName: string;
}

// Mock folder data for breadcrumb demo - you can replace this with real data
interface FolderData {
  id: string;
  name: string;
  parentId?: string | null;
}

export default function DashboardContent({
  userId,
  userName,
}: DashboardContentProps) {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<string>("files");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<FolderData[]>([]);

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

  // Set the active tab based on URL parameter
  useEffect(() => {
    if (tabParam === "profile") {
      setActiveTab("profile");
    } else {
      setActiveTab("files");
    }
  }, [tabParam]);

  const handleFileUploadSuccess = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleFolderChange = useCallback(
    (folderId: string | null, path?: FolderData[]) => {
      setCurrentFolder(folderId);
      if (path) {
        setFolderPath(path);
      } else {
        setFolderPath([]);
      }
    },
    []
  );

  // Email update functionality
  const handleEmailUpdate = async () => {
    if (!user || !newEmail.trim()) return;

    setEmailLoading(true);
    setEmailError(null);

    try {
      // Create email address update request
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

  // Profile section component
  const ProfileSection = () => (
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
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Update Email Address</DialogTitle>
                    <DialogDescription>
                      {verifyingEmail
                        ? "Enter the verification code sent to your new email"
                        : "Enter your new email address"}
                    </DialogDescription>
                  </DialogHeader>

                  <ErrorAlert error={emailError} />

                  <div className="space-y-4">
                    {!verifyingEmail ? (
                      <div className="space-y-2">
                        <Label htmlFor="newEmail">New Email Address</Label>
                        <Input
                          id="newEmail"
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="Enter new email"
                          disabled={emailLoading}
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="emailCode">Verification Code</Label>
                        <Input
                          id="emailCode"
                          type="text"
                          value={emailVerificationCode}
                          onChange={(e) => setEmailVerificationCode(e.target.value)}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          disabled={emailLoading}
                        />
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={resetEmailModal}
                      disabled={emailLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={
                        verifyingEmail ? handleEmailVerification : handleEmailUpdate
                      }
                      disabled={
                        emailLoading ||
                        (!verifyingEmail && !newEmail.trim()) ||
                        (verifyingEmail && emailVerificationCode.length !== 6)
                      }
                    >
                      {emailLoading && <LoadingSpinner className="mr-2" />}
                      {verifyingEmail ? "Verify Email" : "Send Verification Code"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Change Password Button */}
              <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      Enter your current password and choose a new one
                    </DialogDescription>
                  </DialogHeader>

                  <ErrorAlert error={passwordError} />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
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
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
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
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
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
                    <Button
                      variant="outline"
                      onClick={resetPasswordModal}
                      disabled={passwordLoading}
                    >
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
                      {passwordLoading && <LoadingSpinner className="mr-2" />}
                      Update Password
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Delete Account Button */}
              <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-red-600">Delete Account</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your account and all your files.
                    </DialogDescription>
                  </DialogHeader>

                  <ErrorAlert error={deleteError} />

                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-sm text-red-700">
                          <p className="font-medium">Warning:</p>
                          <p>All your files, folders, and account data will be permanently deleted.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deleteConfirmation">
                        Type{" "}
                        <code className="bg-gray-100 px-1 rounded text-sm">
                          DELETE
                        </code>{" "}
                        to confirm
                      </Label>
                      <Input
                        id="deleteConfirmation"
                        type="text"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="Type DELETE to confirm"
                        disabled={deleteLoading}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={resetDeleteModal}
                      disabled={deleteLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleAccountDeletion}
                      disabled={deleteLoading || deleteConfirmation !== "DELETE"}
                    >
                      {deleteLoading && <LoadingSpinner className="mr-2" />}
                      Delete Account
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

  // Files section component
  const FilesSection = () => (
    <>
      {/* Breadcrumb Navigation */}
      {folderPath.length > 0 && (
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => handleFolderChange(null, [])}
                  className="cursor-pointer"
                >
                  <Home className="h-4 w-4" />
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              {folderPath.map((folder, index) => (
                <React.Fragment key={folder.id}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {index === folderPath.length - 1 ? (
                      <BreadcrumbPage>{folder.name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        onClick={() =>
                          handleFolderChange(
                            folder.id,
                            folderPath.slice(0, index + 1)
                          )
                        }
                        className="cursor-pointer"
                      >
                        {folder.name}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <FileUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Upload</h2>
            </CardHeader>
            <CardContent>
              <FileUploadForm
                userId={userId}
                onUploadSuccess={handleFileUploadSuccess}
                currentFolder={currentFolder}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Your Files</h2>
            </CardHeader>
            <CardContent>
              <FileList
                userId={userId}
                refreshTrigger={refreshTrigger}
                onFolderChange={handleFolderChange}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      {activeTab === "profile" ? <ProfileSection /> : <FilesSection />}
    </div>
  );
}