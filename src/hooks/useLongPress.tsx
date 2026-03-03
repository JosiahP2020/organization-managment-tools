import { useState, useRef, useCallback } from "react";

export function useLongPress(delay = 500) {
  const [isPressed, setIsPressed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressedRef = useRef(false);

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

  const handlers = {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: cancel,
  };

  return { isPressed, handlers, reset, pressedRef };
}
