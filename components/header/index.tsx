import "@/components/header/header.css";
import Link from "next/link";

export function Header() {
  return (
    <header className="header">
      <div className="header-actions">
        <Link className="header-link-venda" href="/dados">
          Vendas
        </Link> 
      </div>

      <div className="brand">
        <h1>
          Educa<span>Drones</span>
        </h1>

        <Link className="brand-logo-link" href="/">
          <img src="/imagens/Logo.png" alt="Educa Drones" />
        </Link>
      </div>
    </header>
  );
}
