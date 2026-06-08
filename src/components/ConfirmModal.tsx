"use client";

import { useEffect, useRef } from "react";

interface Props {
  onConfirm: (id: string) => void;
}

export default function ConfirmModal({ onConfirm }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const nameSpanRef = useRef<HTMLSpanElement>(null);
  const idRef = useRef<string>("");

  function openModal(name: string, id: string) {
    const overlay = overlayRef.current;
    const modal = modalRef.current;
    if (!overlay || !modal) return;
    idRef.current = id;
    if (nameSpanRef.current) nameSpanRef.current.textContent = name;
    overlay.classList.remove("hidden");
    overlay.classList.add("flex");
    requestAnimationFrame(function () {
      modal.classList.remove("scale-95", "opacity-0");
      modal.classList.add("scale-100", "opacity-100");
    });
  }

  function closeModal() {
    const modal = modalRef.current;
    const overlay = overlayRef.current;
    if (!modal || !overlay) return;
    modal.classList.remove("scale-100", "opacity-100");
    modal.classList.add("scale-95", "opacity-0");
    setTimeout(function () {
      overlay.classList.add("hidden");
      overlay.classList.remove("flex");
    }, 200);
  }

  function handleConfirm() {
    onConfirm(idRef.current);
    closeModal();
  }

  useEffect(function () {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    document.addEventListener("keydown", handleKey);

    document.querySelectorAll("[data-delete-id]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const el = btn as HTMLElement;
        openModal(el.dataset.deleteName || "", el.dataset.deleteId || "");
      });
    });

    return function () {
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <div
      id="confirm-modal-overlay"
      ref={overlayRef}
      className="fixed inset-0 z-50 hidden items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={function (e) {
        if (e.target === overlayRef.current) closeModal();
      }}
    >
      <div
        id="confirm-modal"
        ref={modalRef}
        className="w-full max-w-sm scale-95 rounded-2xl border border-neutral-700 bg-neutral-900 p-6 opacity-0 shadow-2xl transition-all duration-200"
      >
        <div className="mb-6 text-center">
          <h3 className="text-lg font-semibold text-white">¿Estás seguro?</h3>
          <p className="mt-2 text-sm text-neutral-400">
            Esta acción no se puede deshacer. Se eliminar{"\u00e1"}{" "}
            <span ref={nameSpanRef} className="font-medium text-white" />
            .
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            id="confirm-cancel"
            onClick={closeModal}
            className="flex-1 cursor-pointer rounded-lg border border-neutral-600 px-4 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 cursor-pointer rounded-lg bg-red-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-900"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
