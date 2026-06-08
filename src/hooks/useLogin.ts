"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import gsap from "gsap";

const PIN_LENGTH = 6;

export function useLogin() {
  const [pinError, setPinError] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const pinRef = useRef<string[]>(Array(PIN_LENGTH).fill(""));
  const isSubmittingRef = useRef(false);

  const submitPin = useCallback(async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    const res = await fetch("/api/verify-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: pinRef.current.join("") }),
    });

    if (res.ok) {
      window.location.reload();
    } else if (res.status === 429) {
      isSubmittingRef.current = false;
      const data = await res.json();
      setPinError(data.error || "Demasiados intentos.");
    } else {
      isSubmittingRef.current = false;
      const data = await res.json();
      setPinError(data.error || "Código incorrecto");

      gsap.to(".pin-digit", {
        borderColor: "#f87171",
        boxShadow: "0 0 0 1px #f87171",
        duration: 0.25,
        ease: "power2.out",
        onComplete: () => {
          pinRef.current = Array(PIN_LENGTH).fill("");
          inputRefs.current.forEach((inp) => {
            if (inp) {
              inp.value = "";
              inp.style.borderColor = "";
              inp.style.boxShadow = "";
            }
          });
          inputRefs.current[0]?.focus();
        },
      });
    }
  }, []);

  const handleInput = useCallback(
    (idx: number, value: string) => {
      const digit = value.replace(/\D/g, "").slice(0, 1);

      pinRef.current = [...pinRef.current];
      pinRef.current[idx] = digit;

      if (digit) {
        gsap.fromTo(
          inputRefs.current[idx],
          { scale: 0.85 },
          {
            scale: 1,
            duration: 0.2,
            ease: "back.out(2)",
            borderColor: "#34d399",
            boxShadow: "0 0 0 1px rgba(52, 211, 153, 0.3)",
          },
        );

        if (idx < PIN_LENGTH - 1) {
          inputRefs.current[idx + 1]?.focus();
        }

        if (pinRef.current.every((d) => d !== "")) {
          submitPin();
        }
      } else {
        const el = inputRefs.current[idx];
        if (el) {
          el.style.borderColor = "";
          el.style.boxShadow = "";
        }
      }
    },
    [submitPin],
  );

  const handleKeyDown = useCallback((idx: number, key: string) => {
    if (key === "Backspace" && !pinRef.current[idx] && idx > 0) {
      pinRef.current = [...pinRef.current];
      pinRef.current[idx] = "";
      inputRefs.current[idx - 1]?.focus();
    }
    if (key === "ArrowLeft" && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
    if (key === "ArrowRight" && idx < PIN_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  }, []);

  const handlePaste = useCallback(
    (idx: number, text: string) => {
      const pasted = text.replace(/\D/g, "");
      pinRef.current = [...pinRef.current];

      pasted.split("").slice(0, PIN_LENGTH - idx).forEach((char, i) => {
        pinRef.current[idx + i] = char;
        gsap.fromTo(
          inputRefs.current[idx + i],
          { scale: 0.85 },
          {
            scale: 1,
            duration: 0.2,
            ease: "back.out(2)",
            borderColor: "#34d399",
            boxShadow: "0 0 0 1px rgba(52, 211, 153, 0.3)",
          },
        );
      });

      const fillCount = idx + pasted.length;
      if (fillCount >= PIN_LENGTH) {
        submitPin();
      } else {
        inputRefs.current[fillCount]?.focus();
      }
    },
    [submitPin],
  );

  const handleGoogleLogin = useCallback(async () => {
    setGoogleError(null);
    const { createBrowserClient } = await import("@supabase/ssr");
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { db: { schema: "money" } },
    );

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth/callback",
      },
    });

    if (error) {
      setGoogleError("Error al iniciar sesión con Google. Intentá de nuevo.");
    }
  }, []);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return {
    pinError,
    googleError,
    inputRefs,
    handleInput,
    handleKeyDown,
    handlePaste,
    handleGoogleLogin,
  };
}
