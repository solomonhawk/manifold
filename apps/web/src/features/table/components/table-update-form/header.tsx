export function Header({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <header className="flex justify-between items-center">
      <h2 className="text-lg font-bold">{title}</h2>
      {children}
    </header>
  );
}
