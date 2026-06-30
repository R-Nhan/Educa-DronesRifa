import "@/components/header/header.css";
import Link from "next/link";

export function Header() {
  return (
    <header className="header">
      <Link className="header-link-venda" href="/dados">
        Venda
      </Link>

      <div className="brand">
        <h1>
          Educa<span>Drones</span>
        </h1>

        <Link className="brand-logo-link" href="/">
          <img src="imagens/logo.png" alt="Educa Drones" />
        </Link>
      </div>
    </header>
  );
}
