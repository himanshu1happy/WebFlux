import {
  Scale,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const instruments = [
  {
    id: "LM-WM-00124",
    type: "Electronic Weighing Machine",
    location: "Lucknow",
    status: "Verified",
    validUntil: "14 Sep 2027",
  },
  {
    id: "LM-WM-00125",
    type: "Electronic Weighing Machine",
    location: "Lucknow",
    status: "Verified",
    validUntil: "02 Oct 2027",
  },
  {
    id: "LM-FD-00321",
    type: "Fuel Dispenser",
    location: "Kanpur Road",
    status: "Due Soon",
    validUntil: "18 Oct 2026",
  },
];

function Dashboard() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-[#287d4b]">
            Trader Dashboard
          </p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Good morning, Rahul
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Here's an overview of your registered instruments.
          </p>
        </div>

        <Link
          to="/trader/instruments/add"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#164a63] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#123e53]"
        >
          <Scale size={17} />
          Add Instrument
        </Link>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<Scale size={20} />}
          label="Total instruments"
          value="12"
        />

        <SummaryCard
          icon={<CheckCircle2 size={20} />}
          label="Verified"
          value="9"
        />

        <SummaryCard
          icon={<Clock3 size={20} />}
          label="Due soon"
          value="2"
        />

        <SummaryCard
          icon={<AlertTriangle size={20} />}
          label="Expired"
          value="1"
        />
      </div>

      {/* Instruments */}
      <section className="mt-8 rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="font-semibold text-slate-900">
              Recent instruments
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Your recently registered measuring instruments
            </p>
          </div>

          <Link
            to="/trader/instruments"
            className="flex items-center gap-1 text-sm font-medium text-[#164a63] hover:underline"
          >
            View all
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {instruments.map((instrument) => (
            <InstrumentRow
              key={instrument.id}
              instrument={instrument}
            />
          ))}
        </div>
      </section>

      {/* Quick Action */}
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">
            Need verification?
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Select one or more instruments and submit a verification request.
          </p>

          <Link
            to="/trader/instruments"
            className="mt-4 inline-flex text-sm font-medium text-[#164a63] hover:underline"
          >
            Start a request →
          </Link>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">
            Ownership transfer
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Transfer an instrument while preserving its complete verification
            history.
          </p>

          <Link
            to="/trader/transfers"
            className="mt-4 inline-flex text-sm font-medium text-[#164a63] hover:underline"
          >
            Manage transfers →
          </Link>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-[#164a63]">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-2xl font-semibold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {label}
      </p>
    </div>
  );
}

function InstrumentRow({ instrument }) {
  const isDueSoon = instrument.status === "Due Soon";

  return (
    <Link
      to={`/trader/instruments/${instrument.id}`}
      className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-[#164a63]">
          <Scale size={19} />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">
            {instrument.id}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {instrument.type} · {instrument.location}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-left sm:text-right">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
              isDueSoon
                ? "bg-amber-50 text-amber-700"
                : "bg-green-50 text-green-700"
            }`}
          >
            {instrument.status}
          </span>

          <p className="mt-1 text-xs text-slate-400">
            Valid until {instrument.validUntil}
          </p>
        </div>

        <ArrowRight size={17} className="text-slate-400" />
      </div>
    </Link>
  );
}

export default Dashboard;