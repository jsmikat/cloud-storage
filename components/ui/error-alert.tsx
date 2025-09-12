"use client";

import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface ErrorAlertProps {
  error: string | null;
  variant?: 'error' | 'success' | 'info' | 'warning';
  className?: string;
}

export function ErrorAlert({ 
  error, 
  variant = 'error',
  className = ""
}: ErrorAlertProps) {
  if (!error) return null;

  const variants = {
    error: {
      bgColor: 'bg-destructive/15',
      textColor: 'text-destructive',
      icon: AlertCircle
    },
    success: {
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      icon: CheckCircle
    },
    warning: {
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      icon: AlertTriangle
    },
    info: {
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      icon: Info
    }
  };

  const { bgColor, textColor, icon: Icon } = variants[variant];
  
  return (
    <div className={`flex items-center space-x-2 rounded-md ${bgColor} p-3 text-sm ${textColor} ${className}`}>
      <Icon className="h-4 w-4" />
      <p>{error}</p>
    </div>
  );
}