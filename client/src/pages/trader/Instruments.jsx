import {
  Search,
  Plus,
  Scale,
  Fuel,
  Cylinder,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

function Instruments() {
  const [instruments, setInstruments] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch instruments from WebFlux backend
  useEffect(() => {
    const fetchInstruments = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/instruments"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch instruments");
        }

        const result = await response.json();

        setInstruments(result.data || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load instruments.");
      } finally {
        setLoading(false);
      }
    };

    fetchInstruments();
  }, []);

  // Convert backend data into the format used by our UI
  const formattedInstruments = useMemo(() => {
    return instruments.map((instrument) => {
      let displayCategory = "Weighing";

      if (
        instrument.instrumentType
          ?.toLowerCase()
          .includes("fuel")
      ) {
        displayCategory = "Fuel";
      } else if (
        instrument.instrumentType
          ?.toLowerCase()
          .includes("lpg")
      ) {
        displayCategory = "Gas";
      }

      return {
        id: instrument.instrumentId,
        type: instrument.instrumentType,
        category: displayCategory,
        serialNumber: instrument.serialNumber,
        location: instrument.installationLocation,
        status: instrument.status,
        validUntil: instrument.validUntil
          ? new Date(instrument.validUntil).toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            )
          : "Not available",
      };
    });
  }, [instruments]);

  const filteredInstruments = useMemo(() => {
    return formattedInstruments.filter((instrument) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        instrument.id.toLowerCase().includes(searchText) ||
        instrument.type.toLowerCase().includes(searchText) ||
        instrument.serialNumber.toLowerCase().includes(searchText) ||
        instrument.location.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "All" ||
        instrument.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [formattedInstruments, search, category]);

  const total = instruments.length;

  const verified = instruments.filter(
    (instrument) => instrument.status === "Verified"
  ).length;

  const actionRequired = instruments.filter(
    (instrument) =>
      instrument.status === "Due Soon" ||
      instrument.status === "Expired" ||
      instrument.status === "Pending Verification"
  ).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-[#287d4b]">
            Instrument Management
          </p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            My Instruments
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Manage all weighing and measuring instruments registered to your
            account.
          </p>
        </div>

        <Link
          to="/trader/instruments/add"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#164a63] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#123e53]"
        >
          <Plus size={17} />
          Add Instrument
        </Link>
      </div>

      {/* Summary */}
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total
          </p>

          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {total}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Verified
          </p>

          <p className="mt-1 text-2xl font-semibold text-green-700">
            {verified}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Due / Action Required
          </p>

          <p className="mt-1 text-2xl font-semibold text-amber-700">
            {actionRequired}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-5 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by instrument ID, type, serial number or location"
              className="w-full rounded-md border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#164a63] focus:ring-2 focus:ring-[#164a63]/10"
            />
          </div>

          <div className="relative">
            <Filter
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none rounded-md border border-slate-300 bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-[#164a63] md:w-44"
            >
              <option value="All">All types</option>
              <option value="Weighing">Weighing</option>
              <option value="Fuel">Fuel</option>
              <option value="Gas">Gas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Instrument List */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-semibold text-slate-900">
            Registered instruments
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Each instrument has a permanent digital identity and lifecycle
            history.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-slate-500">
              Loading instruments...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-medium text-red-600">
              {error}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Make sure the WebFlux server is running on port 5000.
            </p>
          </div>
        )}

        {/* Instruments */}
        {!loading && !error && (
          <div className="divide-y divide-slate-100">
            {filteredInstruments.length > 0 ? (
              filteredInstruments.map((instrument) => (
                <InstrumentCard
                  key={instrument.id}
                  instrument={instrument}
                />
              ))
            ) : (
              <div className="px-5 py-12 text-center">
                <p className="text-sm font-medium text-slate-700">
                  No instruments found
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Try changing your search or filter.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InstrumentCard({ instrument }) {
  const icon =
    instrument.category === "Fuel" ? (
      <Fuel size={20} />
    ) : instrument.category === "Gas" ? (
      <Cylinder size={20} />
    ) : (
      <Scale size={20} />
    );

  const isDueSoon =
    instrument.status === "Due Soon" ||
    instrument.status === "Expired" ||
    instrument.status === "Pending Verification";

  return (
    <Link
      to={`/trader/instruments/${instrument.id}`}
      className="group flex flex-col gap-4 px-5 py-5 transition hover:bg-slate-50 lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[#164a63]">
          {icon}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-slate-900">
              {instrument.id}
            </h4>

            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                isDueSoon
                  ? "bg-amber-50 text-amber-700"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {instrument.status}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-600">
            {instrument.type}
          </p>

          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
            <span>
              Serial: {instrument.serialNumber}
            </span>

            <span>
              Location: {instrument.location}
            </span>

            <span>
              Valid until: {instrument.validUntil}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 lg:justify-end">
        <div className="text-xs text-slate-400">
          Digital Instrument ID
        </div>

        <ChevronRight
          size={18}
          className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#164a63]"
        />
      </div>
    </Link>
  );
}

export default Instruments;