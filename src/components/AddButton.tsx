"use client";

import Link from "next/link";

interface Props {
  href?: string;
  label: string;
  bg?: string;
  border?: string;
  text?: string;
  hover?: string;
  onOpen?: () => void;
}

export default function AddButton({
  href,
  label,
  bg = "bg-emerald-500",
  border = "",
  text = "text-white",
  hover = "hover:bg-emerald-800",
  onOpen,
}: Props) {
  const classes = `cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150 ${bg} ${border} ${text} ${hover}`;

  if (onOpen) {
    return (
      <button type="button" onClick={onOpen} className={classes}>
        {label}
      </button>
    );
  }

  return (
    <Link href={href!} className={classes}>
      {label}
    </Link>
  );
}
