"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(function () {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  return null;
}
