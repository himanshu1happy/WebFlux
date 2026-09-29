import { ArrowRight, ShieldCheck, QrCode, MapPin } from "lucide-react";

function Home() {
  return (
    <div className="min-h-screen bg-[#f5f7f8] text-slate-800">
      
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[#164a63]">
              WebFlux
            </h1>
            <p className="text-xs text-slate-500">
              Legal Metrology Digital Platform
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="text-sm font-medium text-slate-600 hover:text-[#164a63]">
              About
            </button>

            <button className="rounded-md border border-[#164a63] px-4 py-2 text-sm font-medium text-[#164a63] hover:bg-slate-50">
              Login
            </button>
          </div>

        </div>
      </header>

      {/* Main */}
      <main>
        
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-6 pb-16 pt-20">
          <div className="max-w-3xl">
            
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#287d4b]">
              Digital Instrument Lifecycle Management
            </p>

            <h2 className="text-4xl font-semibold leading-tight tracking-tight text-slate-900 md:text-5xl">
              One digital identity for every
              <span className="text-[#164a63]"> measuring instrument.</span>
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Register, verify and track the complete lifecycle of weighing
              and measuring instruments through a secure digital platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button className="flex items-center gap-2 rounded-md bg-[#164a63] px-5 py-3 text-sm font-medium text-white hover:bg-[#123e53]">
                Get Started
                <ArrowRight size={17} />
              </button>

              <button className="rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Verify an Instrument
              </button>
            </div>

          </div>
        </section>

        {/* Features */}
        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-px bg-slate-200 md:grid-cols-3">
            
            <Feature
              icon={<ShieldCheck size={22} />}
              title="Digital Instrument Identity"
              description="Maintain a persistent identity and complete verification history for every instrument."
            />

            <Feature
              icon={<QrCode size={22} />}
              title="QR Verification"
              description="Quickly identify an instrument and verify its current status and certificate."
            />

            <Feature
              icon={<MapPin size={22} />}
              title="Field Verification"
              description="Support officers with location-aware inspections and digital evidence."
            />

          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="rounded-lg border border-slate-200 bg-white p-8 md:p-10">
            <h3 className="text-2xl font-semibold text-slate-900">
              Built for traders and Legal Metrology Officers
            </h3>

            <p className="mt-3 max-w-2xl text-slate-600">
              Manage instruments from registration to verification,
              ownership transfer and certificate history from one platform.
            </p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 WebFlux</p>
          <p>Legal Metrology Instrument Lifecycle System</p>
        </div>
      </footer>

    </div>
  );
}

function Feature({ icon, title, description }) {
  return (
    <div className="bg-white p-7">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-[#164a63]">
        {icon}
      </div>

      <h3 className="font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}

export default Home;