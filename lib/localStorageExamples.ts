import {
    SafeLocalStorage,
    getLocalStorage,
    isLocalStorageAvailable,
    setLocalStorage
} from '@/lib/formUtils';
import { useCallback, useState } from 'react';

// Example 1: Basic usage with error handling
export function saveUserPreferences(preferences: { theme: string; language: string }) {
  const success = setLocalStorage('userPreferences', preferences);
  if (!success) {
    console.warn('Failed to save user preferences');
  }
}

export function getUserPreferences() {
  const defaultPrefs = { theme: 'light', language: 'en' };
  return getLocalStorage('userPreferences', defaultPrefs);
}

// Example 2: Using the SafeLocalStorage class (recommended)
export function saveFormData(formId: string, data: any) {
  SafeLocalStorage.set(`formData_${formId}`, data);
}

export function getFormData(formId: string) {
  return SafeLocalStorage.get(`formData_${formId}`, null);
}

export function clearFormData(formId: string) {
  SafeLocalStorage.remove(`formData_${formId}`);
}

// Example 3: Safe usage in React components
export function useLocalStorageState<T>(key: string, defaultValue: T) {
  // Check if localStorage is available (handles SSR)
  if (!isLocalStorageAvailable()) {
    return [defaultValue, () => {}] as const;
  }

  const [state, setState] = useState<T>(() => {
    return SafeLocalStorage.get(key, defaultValue);
  });

  const setValue = useCallback((value: T) => {
    setState(value);
    SafeLocalStorage.set(key, value);
  }, [key]);

  return [state, setValue] as const;
}