import { useEffect, useMemo, useState } from "react";
import {
  Scale,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  ArrowRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";

import { authFetch, formatDate, getUser } from "../../auth";

function Dashboard() {
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = getUser();

  const loadInstruments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await authFetch("/api/instruments");

      // Support either:
      // { instruments: [...] }
      // or directly [...]
      const list = Array.isArray(data)
        ? data
        : data.instruments || data.data || [];

      setInstruments(list);
    } catch (err) {
      console.error("Dashboard instruments error:", err);
      setError(err.message || "Unable to load instruments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstruments();
  }, []);

  const stats = useMemo(() => {
    return {
      total: instruments.length,

      verified: instruments.filter(
        (instrument) => instrument.status === "Verified"
      ).length,

      dueSoon: instruments.filter(
        (instrument) => instrument.status === "Due Soon"
      ).length,

      expired: instruments.filter(
        (instrument) => instrument.status === "Expired"
      ).length,
    };
  }, [instruments]);

  const recentInstruments = useMemo(() => {
    return [...instruments]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [instruments]);

  const displayName =
    user?.contactPerson ||
    user?.name ||
    "Trader";

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-[#287d4b]">
            Trader Dashboard
          </p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Good morning, {displayName}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Here's an overview of your registered instruments.
          </p>
        </div>

        <Link
          to="/trader/instruments/add"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#164a63] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#123e53]"
        >
          <Scale size={17} />
          Add Instrument
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-red-800">
              Unable to load dashboard
            </p>

            <p className="mt-1 text-xs text-red-600">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={loadInstruments}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<Scale size={20} />}
          label="Total instruments"
          value={loading ? "—" : stats.total}
        />

        <SummaryCard
          icon={<CheckCircle2 size={20} />}
          label="Verified"
          value={loading ? "—" : stats.verified}
        />

        <SummaryCard
          icon={<Clock3 size={20} />}
          label="Due soon"
          value={loading ? "—" : stats.dueSoon}
        />

        <SummaryCard
          icon={<AlertTriangle size={20} />}
          label="Expired"
          value={loading ? "—" : stats.expired}
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

        {loading ? (
          <div className="flex items-center justify-center px-5 py-12">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 size={18} className="animate-spin" />
              Loading instruments...
            </div>
          </div>
        ) : recentInstruments.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Scale size={22} />
            </div>

            <h4 className="mt-4 text-sm font-semibold text-slate-900">
              No instruments registered
            </h4>

            <p className="mt-1 text-sm text-slate-500">
              Register your first weighing or measuring instrument to get
              started.
            </p>

            <Link
              to="/trader/instruments/add"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#164a63] px-4 py-2 text-sm font-medium text-white hover:bg-[#123e53]"
            >
              <Scale size={16} />
              Add Instrument
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentInstruments.map((instrument) => (
              <InstrumentRow
                key={instrument._id || instrument.instrumentId}
                instrument={instrument}
              />
            ))}
          </div>
        )}
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
            to="/trader/applications"
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
  const status = instrument.status || "Pending Verification";

  const statusStyles = {
    Verified: "bg-green-50 text-green-700",
    "Due Soon": "bg-amber-50 text-amber-700",
    Expired: "bg-red-50 text-red-700",
    "Pending Verification": "bg-blue-50 text-blue-700",
    Suspended: "bg-red-50 text-red-700",
  };

  const statusClass =
    statusStyles[status] || "bg-slate-100 text-slate-700";

  return (
    <Link
      to={`/trader/instruments/${instrument.instrumentId}`}
      className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-[#164a63]">
          <Scale size={19} />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">
            {instrument.instrumentId}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {instrument.instrumentType || "Instrument"}{" "}
            ·{" "}
            {instrument.installationLocation || "Location not available"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-left sm:text-right">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}
          >
            {status}
          </span>

          <p className="mt-1 text-xs text-slate-400">
            Valid until{" "}
            {instrument.validUntil
              ? formatDate(instrument.validUntil)
              : "Not available"}
          </p>
        </div>

        <ArrowRight size={17} className="text-slate-400" />
      </div>
    </Link>
  );
}

export default Dashboard;