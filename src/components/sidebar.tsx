"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Calendar,
  LayoutDashboard,
  LogOut,
  Scissors,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agendamento", label: "Agendamento", icon: Calendar },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/servicos", label: "Serviços e Preços", icon: Scissors },
  { href: "/financeiro", label: "Caixa / Financeiro", icon: Wallet },
  { href: "/profissionais", label: "Profissionais", icon: UserCheck },
  { href: "/notificacoes", label: "Notificações", icon: Bell },
];

interface SidebarProps {
  userEmail?: string | null;
  logoutAction: () => Promise<void>;
}

export function Sidebar({ userEmail, logoutAction }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar flex flex-col">
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-sidebar-border shrink-0">
        <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Scissors className="size-4" />
        </span>
        <span className="font-heading font-semibold text-sidebar-foreground">
          Gestão de Salão
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-sidebar-border shrink-0">
        <p className="text-xs text-sidebar-foreground/60 mb-2 truncate">{userEmail}</p>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-1.5 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="size-3.5" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
