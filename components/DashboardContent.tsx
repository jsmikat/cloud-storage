"use client";

import FileSection from "@/components/FileSection";
import ProfileSection from "@/components/ProfileSection";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface DashboardContentProps {
  userId: string;
  userName: string;
}

export default function DashboardContent({
  userId,
  userName,
}: DashboardContentProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<string>("files");

  // Set the active tab based on URL parameter
  useEffect(() => {
    if (tabParam === "profile") {
      setActiveTab("profile");
    } else {
      setActiveTab("files");
    }
  }, [tabParam]);

  return (
    <>
      {activeTab === "files" ? (
        <FileSection userId={userId} />
      ) : (
        <ProfileSection userName={userName} />
      )}
    </>
  );
}