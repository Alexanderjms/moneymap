"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import gsap from "gsap";
import type { DrawerData } from "@/src/types";

export function useDrawer(formId: string, apiEndpoint: string) {
  const [isOpen, setIsOpen] = useState(false);
  const [editData, setEditData] = useState<DrawerData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const open = useCallback((data?: DrawerData) => {
    setEditData(data || null);
    setError(null);
    setIsOpen(true);
    document.body.style.overflow = "hidden";

    gsap.set(drawerRef.current, { x: "100%", force3D: true });
    gsap.set(backdropRef.current, { opacity: 0, pointerEvents: "none" });
    backdropRef.current?.classList.add("backdrop-blur-sm");

    gsap.to(backdropRef.current, {
      opacity: 1,
      pointerEvents: "auto",
      duration: 0.25,
      ease: "power4.out",
    });
    gsap.to(drawerRef.current, {
      x: "0%",
      duration: 0.35,
      ease: "power4.out",
    });
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "";

    gsap.to(backdropRef.current, {
      opacity: 0,
      pointerEvents: "none",
      duration: 0.15,
      ease: "power2.inOut",
    });
    gsap.to(drawerRef.current, {
      x: "100%",
      duration: 0.25,
      ease: "power2.inOut",
      onComplete: () => {
        backdropRef.current?.classList.remove("backdrop-blur-sm");
      },
    });
  }, []);

  const submit = useCallback(
    async (formData: Record<string, string>) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      setError(null);

      const body: Record<string, string> = { ...formData };
      if (editData?.id) body.id = editData.id;

      try {
        const res = await fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          close();
          window.location.reload();
        } else {
          const err = await res.json();
          setError(err.error || "Error al guardar");
        }
      } catch {
        setError("Error de conexión");
      } finally {
        setIsSubmitting(false);
      }
    },
    [editData, apiEndpoint, close, isSubmitting],
  );

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) close();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, close]);

  return {
    isOpen,
    editData,
    error,
    isSubmitting,
    drawerRef,
    backdropRef,
    open,
    close,
    submit,
  };
}
