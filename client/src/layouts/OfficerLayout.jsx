import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardCheck,
  FileCheck2,
  LogOut,
  ShieldCheck,
} from "lucide-react";

const navItems = [
  {
    name: "Dashboard",
    path: "/officer/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Inspections",
    path: "/officer/inspections",
    icon: ClipboardCheck,
  },
  {
    name: "Certificates",
    path: "/officer/certificates",
    icon: FileCheck2,
  },
];

function OfficerLayout() {
  return (
    <div className="min-h-screen bg-[#F5F7F8]">

      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#D9E0E5] z-50">

        <div className="h-full px-6 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 bg-[#164A63] rounded-lg flex items-center justify-center">
              <ShieldCheck size={20} className="text-white" />
            </div>

            <div>
              <h1 className="font-semibold text-[#1F2933]">
                WebFlux
              </h1>

              <p className="text-[11px] text-slate-500">
                Legal Metrology Officer Portal
              </p>
            </div>

          </div>

          <div className="flex items-center gap-4">

            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-[#1F2933]">
                LMO Officer
              </p>

              <p className="text-xs text-slate-500">
                Lucknow Division
              </p>
            </div>

            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-[#164A63]">
              LO
            </div>

          </div>

        </div>

      </header>

      {/* Sidebar */}
      <aside className="fixed top-16 bottom-0 left-0 w-64 bg-white border-r border-[#D9E0E5] hidden md:block">

        <nav className="p-4 space-y-1">

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-[#E8F0F4] text-[#164A63]"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <Icon size={18} />
                {item.name}
              </NavLink>
            );
          })}

        </nav>

        <div className="absolute bottom-5 left-4 right-4">

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </aside>

      {/* Main */}
      <main className="pt-16 md:pl-64">

        <div className="p-5 md:p-8">
          <Outlet />
        </div>

      </main>

    </div>
  );
}

export default OfficerLayout;