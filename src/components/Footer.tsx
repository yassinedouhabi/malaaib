const PRO_URL = process.env.NEXT_PUBLIC_PRO_URL ?? "http://pro.localhost:3000";

export default function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} Malaaib</span>
        <a href={`${PRO_URL}/register`} className="underline underline-offset-4 hover:text-foreground transition-colors">
          List your field
        </a>
      </div>
    </footer>
  );
}
