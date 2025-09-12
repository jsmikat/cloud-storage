"use client";

import { Eye, EyeOff } from "lucide-react";
import { Button } from "./button";

interface PasswordToggleProps {
  show: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

export function PasswordToggle({ 
  show, 
  onToggle, 
  disabled = false,
  className = ""
}: PasswordToggleProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={`absolute right-0 top-0 h-full px-3 hover:bg-transparent ${className}`}
      onClick={onToggle}
      disabled={disabled}
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      <span className="sr-only">
        {show ? "Hide password" : "Show password"}
      </span>
    </Button>
  );
}