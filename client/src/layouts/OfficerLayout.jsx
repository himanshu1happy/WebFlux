import {
  NavLink,
  Outlet,
  Link,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  Scale,
  FileText,
  Award,
  ArrowLeftRight,
  UserCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { useState } from "react";

import { getUser, logout } from "../auth";

function TraderLayout() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = getUser();

  const traderName =
    user?.name || "Trader Account";

  const initials = traderName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const navItems = [
    {
      name: "Dashboard",
      path: "/trader/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "My Instruments",
      path: "/trader/instruments",
      icon: Scale,
    },
    {
      name: "Applications",
      path: "/trader/applications",
      icon: FileText,
    },
    {
      name: "Certificates",
      path: "/trader/certificates",
      icon: Award,
    },
    {
      name: "Transfers",
      path: "/trader/transfers",
      icon: ArrowLeftRight,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f5f7f8] text-slate-800">

      {/* Top Header */}
      <header className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-slate-200 bg-white">

        <div className="flex h-full items-center justify-between px-4 md:px-5">

          {/* Logo */}
          <Link
            to="/trader/dashboard"
            className="flex items-center gap-3"
          >

            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#164a63] text-sm font-bold text-white">
              W
            </div>

            <div>
              <h1 className="text-lg font-semibold text-[#164a63]">
                WebFlux
              </h1>

              <p className="hidden text-[10px] text-slate-500 sm:block">
                Legal Metrology Platform
              </p>
            </div>

          </Link>

          {/* Desktop User */}
          <div className="hidden items-center gap-4 md:flex">

            <div className="text-right">

              <p className="text-sm font-medium text-slate-800">
                {traderName}
              </p>

              <p className="text-xs text-slate-500">
                Trader Account
              </p>

            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-[#164a63]">
              {initials || "TR"}
            </div>

          </div>

          {/* Mobile Menu */}
          <button
            type="button"
            onClick={() =>
              setMobileOpen(!mobileOpen)
            }
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>

        </div>

      </header>

      {/* Desktop Sidebar */}
      <aside className="fixed bottom-0 left-0 top-16 hidden w-60 border-r border-slate-200 bg-white md:block">

        <nav className="space-y-1 p-3">

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#e8f0f3] text-[#164a63]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={18} />
                {item.name}
              </NavLink>
            );
          })}

        </nav>

        <div className="absolute bottom-4 left-3 right-3">

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          >
            <LogOut size={18} />
            Sign out
          </button>

        </div>

      </aside>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="fixed left-0 right-0 top-16 z-40 border-b border-slate-200 bg-white shadow-md md:hidden">

          <nav className="space-y-1 p-4">

            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium ${
                      isActive
                        ? "bg-[#e8f0f3] text-[#164a63]"
                        : "text-slate-600"
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.name}
                </NavLink>
              );
            })}

            <div className="my-2 border-t border-slate-200" />

            <div className="px-3 py-2">

              <p className="text-sm font-medium text-slate-800">
                {traderName}
              </p>

              <p className="text-xs text-slate-500">
                Trader Account
              </p>

            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <LogOut size={18} />
              Sign out
            </button>

          </nav>

        </div>
      )}

      {/* Main Content */}
      <main className="pt-16 md:pl-60">

        <div className="mx-auto max-w-7xl p-5 md:p-8">
          <Outlet />
        </div>

      </main>

    </div>
  );
}

export default TraderLayout;