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
  useIngresos,
  useDeleteIngreso,
  useUpsertIngreso,
} from "@/src/hooks/useQueries";
import type { Ingreso } from "@/src/types";

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

const columnHelper = createColumnHelper<Ingreso>();

export default function IngresosClient() {
  const { data: ingresos = [], isLoading } = useIngresos();
  const deleteIngreso = useDeleteIngreso();
  const upsertIngreso = useUpsertIngreso();

  const [sorting, setSorting] = useState<SortingState>([]);

  const {
    editData,
    drawerRef,
    backdropRef,
    open,
    close,
  } = useDrawer("ingreso-form", "/api/ingresos");

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("HNL");
  const [date, setDate] = useState("");

  function openNew() {
    setName("");
    setAmount("");
    setCurrency("HNL");
    setDate(new Date().toISOString().slice(0, 10));
    open();
  }

  function openEdit(ing: Ingreso) {
    setName(ing.name);
    setAmount(Number(ing.amount).toLocaleString("en"));
    setCurrency(ing.currency || "HNL");
    setDate(ing.date);
    open({
      id: ing.id,
      name: ing.name,
      amount: String(ing.amount),
      date: ing.date,
      currency: ing.currency,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body: Record<string, unknown> = {
      name,
      amount: amount.replace(/,/g, ""),
      date,
      currency,
    };
    if (editData?.id) body.id = editData.id;
    upsertIngreso.mutate(body, {
      onSuccess: () => close(),
    });
  }

  const editId = editData?.id;

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Nombre",
        cell: (info) => (
          <span className="text-white">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("amount", {
        header: "Monto",
        sortingFn: "basic",
        cell: (info) => {
          const ing = info.row.original;
          return (
            <span className="text-emerald-400">
              {ing.currency === "USD" ? "$" : "L."}{" "}
              {Number(ing.amount).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
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
    data: ingresos,
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
          <h1 className="text-2xl font-semibold">Ingresos</h1>
          <AddButton
            label="Nuevo ingreso"
            bg="bg-emerald-700"
            text="text-white"
            onOpen={openNew}
          />
        </div>

        {isLoading ? (
          <p className="py-12 text-center text-neutral-500">Cargando...</p>
        ) : ingresos.length > 0 ? (
          <>
            <div className="max-sm:hidden overflow-x-auto rounded-md border border-neutral-800">
              <table className="w-full min-w-[500px] text-sm">
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

            <div className="sm:hidden space-y-3">
              {table.getRowModel().rows.map((row) => {
                const ing = row.original;
                const amountStr =
                  (ing.currency === "USD" ? "$" : "L.") +
                  " " +
                  Number(ing.amount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  });
                return (
                  <div
                    key={row.id}
                    className="rounded-xl border border-neutral-800/60 bg-neutral-900/30 p-4"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <span className="text-sm font-medium text-white">{ing.name}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(ing)}
                          className="cursor-pointer rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-white"
                        >
                          <Icon icon="mdi:pencil" className="text-lg" />
                        </button>
                        <button
                          type="button"
                          data-delete-id={ing.id}
                          data-delete-name={ing.name}
                          className="cursor-pointer rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-red-400"
                        >
                          <Icon icon="mdi:delete" className="text-lg" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-400 font-medium">{amountStr}</span>
                      <span className="text-xs text-neutral-400">{formatDate(ing.date)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="py-12 text-center text-neutral-500">
            No tenés ingresos registrados todavía.
          </p>
        )}
      </div>

      <ConfirmModal
        onConfirm={(id) => deleteIngreso.mutate(id)}
      />

      <div
        ref={backdropRef}
        id="drawer-backdrop"
        className="pointer-events-none fixed inset-0 z-40 bg-black/60 opacity-0"
        onClick={close}
      />

      <div
        ref={drawerRef}
        id="ingreso-drawer"
        className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-neutral-800 bg-neutral-950 shadow-2xl will-change-transform sm:w-1/2"
        style={{ transform: "translateX(100%)" }}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-4 sm:px-6">
          <h2 id="drawer-title" className="text-lg font-semibold">
            {editId ? "Editar ingreso" : "Nuevo ingreso"}
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
          {upsertIngreso.isError && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {upsertIngreso.error?.message || "Error al guardar"}
            </div>
          )}

          <form id="ingreso-form" onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="id" id="edit-id" value={editId || ""} />
            <div>
              <label htmlFor="name" className="mb-1 block text-sm text-neutral-400">
                Nombre
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800/50 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label htmlFor="amount" className="mb-1 block text-sm text-neutral-400">
                  Monto
                </label>
                <div className="flex items-center rounded-lg border border-neutral-700 bg-neutral-800/50 text-sm transition-colors focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                  <span id="currency-symbol" className="pl-3 pr-1 text-neutral-400">
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
                <label className="mb-1 block text-sm text-neutral-400">Moneda</label>
                <CurrencyToggle
                  currency={currency}
                  onChange={(c) => setCurrency(c)}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-neutral-400">Fecha</label>
              <DatePicker
                name="date"
                value={date || undefined}
                accent="emerald"
                onChange={(v) => setDate(v)}
              />
            </div>
            <button
              type="submit"
              disabled={upsertIngreso.isPending}
              className="w-full cursor-pointer rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-800 disabled:opacity-50"
            >
              {upsertIngreso.isPending ? "Guardando..." : "Guardar"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
