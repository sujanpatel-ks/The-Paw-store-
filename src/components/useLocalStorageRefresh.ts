/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Custom React Hook that synchronizes state with Local Storage.
 * It automatically re-fetches data from localStorage on mount,
 * and listens to both native "storage" events (cross-iframe/tab) and a custom
 * "local-storage-sync" event to ensure immediate updates.
 */
export function useLocalStorageSync<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  
  const initialValueRef = useRef<T>(initialValue);

  // Keep the ref updated with the latest initialValue
  useEffect(() => {
    initialValueRef.current = initialValue;
  }, [initialValue]);

  // Safe helper to read from local storage
  const readValue = useCallback((): T => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        return JSON.parse(item) as T;
      }
      return initialValueRef.current;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValueRef.current;
    }
  }, [key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Wrapped setter to update state and persist to local storage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          
          // Dispatch a custom storage event so other instances of the hook on the same page sync immediately
          window.dispatchEvent(new CustomEvent("local-storage-sync", { detail: { key } }));
          return valueToStore;
        });
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  // Manual or automatic re-fetch function
  const refresh = useCallback(() => {
    setStoredValue(readValue());
  }, [readValue]);

  // Synchronize on mount and handle external localStorage events
  useEffect(() => {
    // Re-fetch on mount
    refresh();

    // Listen to changes from other tabs/iframes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        refresh();
      }
    };

    // Listen to changes from the same tab/iframe
    const handleLocalChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.key === key) {
        refresh();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("local-storage-sync", handleLocalChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("local-storage-sync", handleLocalChange);
    };
  }, [key, refresh]);

  return [storedValue, setValue, refresh];
}
