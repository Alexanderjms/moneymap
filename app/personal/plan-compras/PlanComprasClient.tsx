"use client";

import { Icon } from "@iconify/react";
import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
} from "@tanstack/react-table";
import AddButton from "@/src/components/AddButton";
import ConfirmModal from "@/src/components/ConfirmModal";
import DatePicker from "@/src/components/DatePicker";
import CurrencyToggle from "@/src/components/CurrencyToggle";
import { useDrawer } from "@/src/hooks/useDrawer";
import {
  usePlanCompras,
  useDeletePlanCompra,
  useUpsertPlanCompra,
} from "@/src/hooks/useQueries";
import type { PlanCompra } from "@/src/types";

function formatDate(d: string) {
  const date = new Date(d);
  return (
    date.getDate() +
    " de " +
    date.toLocaleDateString("es", { month: "long" }) +
    " del " +
    date.getFullYear()
  );
}

const columnHelper = createColumnHelper<PlanCompra>();

export default function PlanComprasClient() {
  const { data: items = [], isLoading } = usePlanCompras();
  const deleteItem = useDeletePlanCompra();
  const upsertItem = useUpsertPlanCompra();

  const [sorting, setSorting] = useState<SortingState>([]);

  const { editData, drawerRef, backdropRef, open, close } = useDrawer(
    "plan-compra-form",
    "/api/plan-compras",
  );

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("HNL");
  const [date, setDate] = useState("");
  const [purchased, setPurchased] = useState(false);
  const [url, setUrl] = useState("");

  function openNew() {
    setName("");
    setAmount("");
    setCurrency("HNL");
    setDate(new Date().toISOString().slice(0, 10));
    setPurchased(false);
    setUrl("");
    open();
  }

  function openEdit(item: PlanCompra) {
    setName(item.name);
    setAmount(Number(item.amount).toLocaleString("en"));
    setCurrency(item.currency || "HNL");
    setDate(item.date);
    setPurchased(item.purchased);
    setUrl(item.url || "");
    open({
      id: item.id,
      name: item.name,
      amount: String(item.amount),
      date: item.date,
      currency: item.currency,
      purchased: item.purchased,
      url: item.url,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body: Record<string, unknown> = {
      name,
      amount: amount.replace(/,/g, ""),
      date,
      currency,
      purchased,
      url: url || null,
    };
    if (editData?.id) body.id = editData.id;
    upsertItem.mutate(body, {
      onSuccess: () => close(),
    });
  }

  async function togglePurchased(item: PlanCompra) {
    upsertItem.mutate({
      id: item.id,
      name: item.name,
      amount: String(item.amount),
      date: item.date,
      currency: item.currency,
      purchased: !item.purchased,
      url: item.url || null,
    });
  }

  const editId = editData?.id;

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Nombre",
        cell: (info) => <span className="text-white">{info.getValue()}</span>,
      }),
      columnHelper.accessor("amount", {
        header: "Monto",
        sortingFn: "basic",
        cell: (info) => {
          const item = info.row.original;
          return (
            <span
              className={
                item.purchased
                  ? "text-neutral-500 line-through"
                  : "text-emerald-400"
              }
            >
              {item.currency === "USD" ? "$" : "L."}{" "}
              {Number(item.amount).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          );
        },
      }),
      columnHelper.accessor("url", {
        header: "Link",
        cell: (info) => {
          const urlVal = info.getValue();
          return urlVal ? (
            <a
              href={urlVal}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors"
            >
              <Icon icon="mdi:open-in-new" className="h-4 w-4" />
            </a>
          ) : null;
        },
      }),
      columnHelper.accessor("purchased", {
        header: "Estado",
        cell: (info) => {
          const item = info.row.original;
          return (
            <button
              type="button"
              onClick={() => togglePurchased(item)}
              className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                item.purchased
                  ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
              }`}
            >
              {item.purchased ? "Comprado" : "Pendiente"}
            </button>
          );
        },
      }),
      columnHelper.accessor("date", {
        header: "Fecha",
        sortingFn: "datetime",
        cell: (info) => (
          <span className="text-neutral-400">
            {formatDate(info.getValue())}
          </span>
        ),
      }),
      columnHelper.display({
        id: "acciones",
        header: "Acciones",
        cell: (info) => (
          <div className="flex items-center justify-start gap-2">
            <button
              type="button"
              onClick={() => openEdit(info.row.original)}
              className="cursor-pointer text-xl text-neutral-500 transition-colors hover:text-white"
            >
              <Icon icon="mdi:pencil" />
            </button>
            <button
              type="button"
              data-delete-id={info.row.original.id}
              data-delete-name={info.row.original.name}
              className="cursor-pointer text-xl text-neutral-500 transition-colors hover:text-red-400"
            >
              <Icon icon="mdi:delete" />
            </button>
          </div>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: items,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Plan de compras</h1>
          <AddButton
            label="Agregar"
            bg="bg-violet-700"
            text="text-white"
            onOpen={openNew}
          />
        </div>

        {isLoading ? (
          <p className="py-12 text-center text-neutral-500">Cargando...</p>
        ) : items.length > 0 ? (
          <>
            <div className="max-sm:hidden overflow-x-auto rounded-md border border-neutral-800">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr
                      key={headerGroup.id}
                      className="border-b border-neutral-800 bg-neutral-900/50"
                    >
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="cursor-pointer px-4 py-3 text-left font-medium text-neutral-400 select-none"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {{
                            asc: " ▲",
                            desc: " ▼",
                          }[header.column.getIsSorted() as string] ?? null}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-neutral-800/50 last:border-0"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden space-y-2.5">
              {table.getRowModel().rows.map((row) => {
                const item = row.original;
                const amountStr =
                  (item.currency === "USD" ? "$" : "L.") +
                  " " +
                  Number(item.amount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  });
                return (
                  <div
                    key={row.id}
                    className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                      item.purchased
                        ? "border-neutral-800/30 bg-neutral-900/10"
                        : "border-neutral-800/50 bg-neutral-900/40"
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 mr-2">
                          <span className={`block text-sm font-semibold leading-tight tracking-tight ${
                            item.purchased
                              ? "text-neutral-500 line-through decoration-neutral-600"
                              : "text-neutral-100"
                          }`}>
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 -mr-1 -mt-1">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="cursor-pointer rounded-lg p-1.5 text-neutral-500 transition-all duration-200 hover:bg-neutral-800 hover:text-white"
                          >
                            <Icon icon="mdi:pencil" className="text-lg" />
                          </button>
                          <button
                            type="button"
                            data-delete-id={item.id}
                            data-delete-name={item.name}
                            className="cursor-pointer rounded-lg p-1.5 text-neutral-500 transition-all duration-200 hover:bg-neutral-800 hover:text-red-400"
                          >
                            <Icon icon="mdi:delete" className="text-lg" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => togglePurchased(item)}
                          className={`flex items-center gap-2 transition-all duration-200 ${
                            item.purchased
                              ? "text-neutral-500 hover:text-neutral-300"
                              : "text-neutral-500 hover:text-neutral-300"
                          }`}
                        >
                          <span className={`relative flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                            item.purchased
                              ? "border-neutral-500 bg-neutral-500/20"
                              : "border-neutral-600 bg-transparent group-hover:border-neutral-500"
                          }`}>
                            {item.purchased && (
                              <Icon icon="mdi:check" className="h-2.5 w-2.5 text-neutral-300" />
                            )}
                          </span>
                          <span className="text-[11px] font-medium uppercase tracking-wider">
                            {item.purchased ? "Comprado" : "Pendiente"}
                          </span>
                        </button>

                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-neutral-500 transition-all duration-200 hover:bg-neutral-800 hover:text-neutral-200"
                          >
                            <span>Ver</span>
                            <Icon icon="mdi:arrow-top-right" className="h-3 w-3" />
                          </a>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-neutral-800/50 pt-3">
                        <span className={`text-sm font-bold tracking-tight ${
                          item.purchased
                            ? "text-neutral-600 line-through decoration-neutral-600"
                            : "text-emerald-400"
                        }`}>
                          {amountStr}
                        </span>
                        <span className="text-[11px] text-neutral-500">
                          {formatDate(item.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="py-12 text-center text-neutral-500">
            No tenés nada en tu plan de compras todavía.
          </p>
        )}
      </div>

      <ConfirmModal onConfirm={(id) => deleteItem.mutate(id)} />

      <div
        ref={backdropRef}
        id="drawer-backdrop"
        className="pointer-events-none fixed inset-0 z-40 bg-black/60 opacity-0"
        onClick={close}
      />

      <div
        ref={drawerRef}
        id="plan-compra-drawer"
        className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-neutral-800 bg-neutral-950 shadow-2xl will-change-transform sm:w-1/2"
        style={{ transform: "translateX(100%)" }}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-4 sm:px-6">
          <h2 id="drawer-title" className="text-lg font-semibold">
            {editId ? "Editar item" : "Nuevo item"}
          </h2>
          <button
            id="drawer-close"
            type="button"
            onClick={close}
            className="cursor-pointer text-neutral-500 transition-colors hover:text-white"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 15 15">
              <path d="M12.854.146a.5.5 0 0 0-.707 0L7.5 4.793 2.854.146a.5.5 0 0 0-.708.708L6.793 5.5.146 10.146a.5.5 0 0 0 .708.708L7.5 6.207l4.646 4.647a.5.5 0 0 0 .708-.708L8.207 5.5l4.647-4.646a.5.5 0 0 0 0-.708z" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          {upsertItem.isError && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {upsertItem.error?.message || "Error al guardar"}
            </div>
          )}

          <form
            id="plan-compra-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <input type="hidden" name="id" id="edit-id" value={editId || ""} />
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm text-neutral-400"
              >
                Nombre
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800/50 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label
                  htmlFor="amount"
                  className="mb-1 block text-sm text-neutral-400"
                >
                  Monto estimado
                </label>
                <div className="flex items-center rounded-lg border border-neutral-700 bg-neutral-800/50 text-sm transition-colors focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500">
                  <span className="pl-3 pr-1 text-neutral-400">
                    {currency === "USD" ? "$" : "L."}
                  </span>
                  <input
                    id="amount"
                    name="amount"
                    type="text"
                    inputMode="decimal"
                    required
                    value={amount}
                    onInput={(e) => {
                      const el = e.currentTarget;
                      const v = el.value
                        .replace(/[^0-9.]/g, "")
                        .replace(/(\..*?)\./g, "$1");
                      const p = v.split(".");
                      p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                      el.value = p.join(".");
                      setAmount(el.value);
                    }}
                    className="w-full bg-transparent py-2.5 pr-3 text-white outline-none"
                  />
                </div>
              </div>
              <div className="w-28">
                <label className="mb-1 block text-sm text-neutral-400">
                  Moneda
                </label>
                <CurrencyToggle
                  currency={currency}
                  onChange={(c) => setCurrency(c)}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-neutral-400">
                Fecha
              </label>
              <DatePicker
                name="date"
                value={date || undefined}
                accent="violet"
                onChange={(v) => setDate(v)}
              />
            </div>
            <div>
              <label
                htmlFor="url"
                className="mb-1 block text-sm text-neutral-400"
              >
                Link del producto
              </label>
              <input
                id="url"
                name="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800/50 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <label className="flex items-center justify-between rounded-lg border border-neutral-700 bg-neutral-800/50 px-4 py-3 cursor-pointer transition-colors hover:bg-neutral-700/50">
              <span className="text-sm text-neutral-300">Comprado</span>
              <div
                className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${purchased ? "bg-violet-600" : "bg-neutral-600"}`}
              >
                <input
                  type="checkbox"
                  checked={purchased}
                  onChange={(e) => setPurchased(e.target.checked)}
                  className="peer sr-only"
                />
                <div
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${purchased ? "translate-x-5" : "translate-x-0"}`}
                >
                  <Icon
                    icon={purchased ? "mdi:check" : "mdi:close"}
                    className={`h-full w-full p-1 transition-colors duration-200 ${purchased ? "text-violet-600" : "text-neutral-500"}`}
                  />
                </div>
              </div>
            </label>
            <button
              type="submit"
              disabled={upsertItem.isPending}
              className="w-full cursor-pointer rounded-md bg-violet-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-800 disabled:opacity-50"
            >
              {upsertItem.isPending ? "Guardando..." : "Guardar"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
