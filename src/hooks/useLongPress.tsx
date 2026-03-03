import { useState, useRef, useCallback, useEffect } from "react";

export function useLongPress(delay = 500) {
  const [isPressed, setIsPressed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressedRef = useRef(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const start = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setIsPressed(true);
      pressedRef.current = true;
    }, delay);
  }, [delay]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setIsPressed(false);
    pressedRef.current = false;
  }, []);

  // Dismiss when tapping outside the card
  useEffect(() => {
    if (!isPressed) return;

    const handleOutsideClick = (e: TouchEvent | MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        reset();
      }
    };

    document.addEventListener("touchstart", handleOutsideClick, true);
    document.addEventListener("mousedown", handleOutsideClick, true);
    return () => {
      document.removeEventListener("touchstart", handleOutsideClick, true);
      document.removeEventListener("mousedown", handleOutsideClick, true);
    };
  }, [isPressed, reset]);

  const handlers = {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: cancel,
  };

  return { isPressed, handlers, reset, pressedRef, cardRef };
}
