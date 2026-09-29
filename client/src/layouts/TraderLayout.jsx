import { NavLink, Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Scale,
  FileText,
  Award,
  ArrowLeftRight,
  UserCircle,
  LogOut,
} from "lucide-react";

function TraderLayout() {
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

  return (
    <div className="min-h-screen bg-[#f5f7f8] text-slate-800">
      {/* Top Header */}
      <header className="fixed left-0 right-0 top-0 z-30 h-16 border-b border-slate-200 bg-white">
        <div className="flex h-full items-center justify-between px-5">
          <Link to="/trader/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#164a63] text-sm font-bold text-white">
              W
            </div>

            <div>
              <h1 className="text-lg font-semibold text-[#164a63]">
                WebFlux
              </h1>
              <p className="text-[10px] text-slate-500">
                Legal Metrology Platform
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-800">
                Rahul Traders
              </p>
              <p className="text-xs text-slate-500">
                Trader Account
              </p>
            </div>

            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50">
              <UserCircle size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
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
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800">
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

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