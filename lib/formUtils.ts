export function getErrorMessage(error: any): string {
  // Handle Clerk errors
  if (error?.errors && Array.isArray(error.errors) && error.errors.length > 0) {
    return error.errors[0].message;
  }
  
  // Handle other error formats
  if (error?.message) {
    return error.message;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle HTTP errors
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  // Handle API errors with error property
  if (error?.error) {
    return error.error;
  }
  
  // Fallback for unknown error formats
  return "An unexpected error occurred. Please try again.";
}


export interface FormState {
  isSubmitting: boolean;
  error: string | null;
}


export async function handleFormSubmission<T>(
  submitFn: () => Promise<T>,
  setIsSubmitting: (loading: boolean) => void,
  setError: (error: string | null) => void
): Promise<T | null> {
  setIsSubmitting(true);
  setError(null);
  
  try {
    const result = await submitFn();
    return result;
  } catch (error: any) {
    const errorMessage = getErrorMessage(error);
    setError(errorMessage);
    console.error("Form submission error:", error);
    return null;
  } finally {
    setIsSubmitting(false);
  }
}

/**
 * Validation utilities
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}


export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}


export function setLocalStorage(key: string, value: any): boolean {
  try {
    // Handle undefined or null values
    if (value === undefined || value === null) {
      localStorage.removeItem(key);
      return true;
    }
    
    // Ensure proper serialization
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
}

export function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    
    // Return default if item doesn't exist
    if (item === null || item === undefined) {
      return defaultValue;
    }
    
    // Handle empty strings
    if (item === '') {
      return defaultValue;
    }
    
    // Check if the item looks like it might not be valid JSON
    if (item === '[object Object]' || item === 'undefined' || item === 'null') {
      console.warn(`Invalid localStorage value for key "${key}": ${item}`);
      localStorage.removeItem(key); // Clean up invalid data
      return defaultValue;
    }
    
    // Try to parse the JSON
    const parsed = JSON.parse(item);
    return parsed;
  } catch (error) {
    console.error(`Failed to read from localStorage for key "${key}":`, error);
    console.error(`Raw value was: ${localStorage.getItem(key)}`);
    
    // Clean up corrupted data
    try {
      localStorage.removeItem(key);
    } catch (cleanupError) {
      console.error('Failed to remove corrupted localStorage item:', cleanupError);
    }
    
    return defaultValue;
  }
}

/**
 * Safe localStorage utilities that handle SSR and browser compatibility
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, 'test');
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function clearLocalStorage(prefix?: string): boolean {
  try {
    if (prefix) {
      // Clear only items with specific prefix
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } else {
      // Clear all localStorage
      localStorage.clear();
    }
    return true;
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
    return false;
  }
}

/**
 * Type-safe localStorage hook-like utilities
 */
export class SafeLocalStorage {
  private static isAvailable = isLocalStorageAvailable();

  static set<T>(key: string, value: T): boolean {
    if (!this.isAvailable) return false;
    return setLocalStorage(key, value);
  }

  static get<T>(key: string, defaultValue: T): T {
    if (!this.isAvailable) return defaultValue;
    return getLocalStorage(key, defaultValue);
  }

  static remove(key: string): boolean {
    if (!this.isAvailable) return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  static has(key: string): boolean {
    if (!this.isAvailable) return false;
    return localStorage.getItem(key) !== null;
  }
}