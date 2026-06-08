import Header from "@/src/components/Header";

export default function PersonalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl py-8">{children}</main>
    </>
  );
}
