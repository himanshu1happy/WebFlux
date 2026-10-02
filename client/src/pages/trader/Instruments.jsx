import {
  Search,
  Plus,
  Scale,
  Fuel,
  Cylinder,
  ChevronRight,
  Filter,
  RefreshCw,
  Loader2,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import { authFetch, formatDate } from "../../auth";


function Instruments() {
  const [instruments, setInstruments] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ======================================================
  // FETCH INSTRUMENTS
  // ======================================================

  const fetchInstruments = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await authFetch("/api/instruments");

      const list = Array.isArray(result)
        ? result
        : result.data || result.instruments || [];

      setInstruments(list);
    } catch (err) {
      console.error("Fetch instruments error:", err);

      setError(
        err.message || "Unable to load instruments."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchInstruments();
  }, []);


  // ======================================================
  // FORMAT DATA FOR UI
  // ======================================================

  const formattedInstruments = useMemo(() => {
    return instruments.map((instrument) => {
      let displayCategory = "Weighing";

      const type =
        instrument.instrumentType || "";

      const typeLower =
        type.toLowerCase();


      if (
        typeLower.includes("fuel") ||
        typeLower.includes("petrol") ||
        typeLower.includes("diesel") ||
        typeLower.includes("dispenser")
      ) {
        displayCategory = "Fuel";
      } else if (
        typeLower.includes("lpg") ||
        typeLower.includes("gas") ||
        typeLower.includes("cylinder")
      ) {
        displayCategory = "Gas";
      }


      return {
        id: instrument.instrumentId,

        type:
          instrument.instrumentType ||
          "Instrument",

        category: displayCategory,

        serialNumber:
          instrument.serialNumber ||
          "Not available",

        location:
          instrument.installationLocation ||
          "Not available",

        status:
          instrument.status ||
          "Pending Verification",

        validUntil:
          instrument.validUntil
            ? formatDate(instrument.validUntil)
            : "Not available",
      };
    });
  }, [instruments]);


  // ======================================================
  // SEARCH + FILTER
  // ======================================================

  const filteredInstruments = useMemo(() => {
    const searchText =
      search.trim().toLowerCase();

    return formattedInstruments.filter(
      (instrument) => {
        const matchesSearch =
          !searchText ||
          instrument.id
            .toLowerCase()
            .includes(searchText) ||
          instrument.type
            .toLowerCase()
            .includes(searchText) ||
          instrument.serialNumber
            .toLowerCase()
            .includes(searchText) ||
          instrument.location
            .toLowerCase()
            .includes(searchText);


        const matchesCategory =
          category === "All" ||
          instrument.category === category;


        return (
          matchesSearch &&
          matchesCategory
        );
      }
    );
  }, [
    formattedInstruments,
    search,
    category,
  ]);


  // ======================================================
  // SUMMARY
  // ======================================================

  const total = instruments.length;

  const verified =
    instruments.filter(
      (instrument) =>
        instrument.status === "Verified"
    ).length;

  const dueSoon =
    instruments.filter(
      (instrument) =>
        instrument.status === "Due Soon"
    ).length;

  const expired =
    instruments.filter(
      (instrument) =>
        instrument.status === "Expired"
    ).length;

  const pending =
    instruments.filter(
      (instrument) =>
        instrument.status ===
        "Pending Verification"
    ).length;

  const actionRequired =
    dueSoon +
    expired +
    pending;


  return (
    <div>

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">

        <div>

          <p className="text-sm font-medium text-[#287d4b]">
            Instrument Management
          </p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            My Instruments
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Manage all weighing and measuring
            instruments registered to your account.
          </p>

        </div>


        <Link
          to="/trader/instruments/add"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#164a63] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#123e53]"
        >
          <Plus size={17} />
          Add Instrument
        </Link>

      </div>


      {/* ==================================================
          SUMMARY
      ================================================== */}

      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <SummaryCard
          label="Total"
          value={loading ? "—" : total}
          valueClass="text-slate-900"
        />

        <SummaryCard
          label="Verified"
          value={loading ? "—" : verified}
          valueClass="text-green-700"
        />

        <SummaryCard
          label="Due Soon"
          value={loading ? "—" : dueSoon}
          valueClass="text-amber-700"
        />

        <SummaryCard
          label="Action Required"
          value={loading ? "—" : actionRequired}
          valueClass="text-red-700"
        />

      </div>


      {/* ==================================================
          SEARCH + FILTER
      ================================================== */}

      <div className="mb-5 rounded-lg border border-slate-200 bg-white p-4">

        <div className="flex flex-col gap-3 md:flex-row">

          {/* Search */}

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by instrument ID, type, serial number or location"
              className="w-full rounded-md border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#164a63] focus:ring-2 focus:ring-[#164a63]/10"
            />

          </div>


          {/* Category */}

          <div className="relative">

            <Filter
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="w-full appearance-none rounded-md border border-slate-300 bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-[#164a63] md:w-44"
            >
              <option value="All">
                All types
              </option>

              <option value="Weighing">
                Weighing
              </option>

              <option value="Fuel">
                Fuel
              </option>

              <option value="Gas">
                Gas
              </option>
            </select>

          </div>

        </div>

      </div>


      {/* ==================================================
          INSTRUMENT LIST
      ================================================== */}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

          <div>

            <h3 className="font-semibold text-slate-900">
              Registered instruments
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Each instrument has a permanent digital
              identity and lifecycle history.
            </p>

          </div>

          {!loading && !error && (
            <span className="text-xs text-slate-400">
              {filteredInstruments.length}{" "}
              {filteredInstruments.length === 1
                ? "instrument"
                : "instruments"}
            </span>
          )}

        </div>


        {/* ==================================================
            LOADING
        ================================================== */}

        {loading && (

          <div className="flex items-center justify-center px-5 py-14">

            <div className="flex items-center gap-2 text-sm text-slate-500">

              <Loader2
                size={18}
                className="animate-spin"
              />

              Loading instruments...

            </div>

          </div>

        )}


        {/* ==================================================
            ERROR
        ================================================== */}

        {!loading && error && (

          <div className="px-5 py-14 text-center">

            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
              !
            </div>

            <p className="mt-4 text-sm font-medium text-red-600">
              {error}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Make sure the WebFlux server is running.
            </p>

            <button
              type="button"
              onClick={fetchInstruments}
              className="mt-4 inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={15} />
              Retry
            </button>

          </div>

        )}


        {/* ==================================================
            RESULTS
        ================================================== */}

        {!loading &&
          !error &&
          filteredInstruments.length > 0 && (

            <div className="divide-y divide-slate-100">

              {filteredInstruments.map(
                (instrument) => (

                  <InstrumentCard
                    key={instrument.id}
                    instrument={instrument}
                  />

                )
              )}

            </div>

          )}


        {/* ==================================================
            EMPTY DATABASE
        ================================================== */}

        {!loading &&
          !error &&
          instruments.length === 0 && (

            <EmptyState
              title="No instruments registered"
              description="Register your first weighing or measuring instrument to start its digital lifecycle."
              showAdd
            />

          )}


        {/* ==================================================
            NO SEARCH RESULTS
        ================================================== */}

        {!loading &&
          !error &&
          instruments.length > 0 &&
          filteredInstruments.length === 0 && (

            <EmptyState
              title="No matching instruments"
              description="Try changing your search text or instrument category."
            />

          )}

      </div>

    </div>
  );
}


// ======================================================
// SUMMARY CARD
// ======================================================

function SummaryCard({
  label,
  value,
  valueClass,
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">

      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p
        className={`mt-1 text-2xl font-semibold ${valueClass}`}
      >
        {value}
      </p>

    </div>
  );
}


// ======================================================
// EMPTY STATE
// ======================================================

function EmptyState({
  title,
  description,
  showAdd = false,
}) {
  return (
    <div className="px-5 py-14 text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-[#164a63]">
        <Scale size={22} />
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-800">
        {title}
      </p>

      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
        {description}
      </p>

      {showAdd && (
        <Link
          to="/trader/instruments/add"
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#164a63] px-4 py-2 text-sm font-medium text-white hover:bg-[#123e53]"
        >
          <Plus size={16} />
          Add Instrument
        </Link>
      )}

    </div>
  );
}


// ======================================================
// INSTRUMENT CARD
// ======================================================

function InstrumentCard({ instrument }) {

  const icon =
    instrument.category === "Fuel"
      ? <Fuel size={20} />
      : instrument.category === "Gas"
      ? <Cylinder size={20} />
      : <Scale size={20} />;


  const statusStyles = {
    Verified:
      "bg-green-50 text-green-700",

    "Due Soon":
      "bg-amber-50 text-amber-700",

    Expired:
      "bg-red-50 text-red-700",

    Suspended:
      "bg-red-50 text-red-700",

    "Pending Verification":
      "bg-blue-50 text-blue-700",
  };


  const statusClass =
    statusStyles[instrument.status] ||
    "bg-slate-100 text-slate-700";


  return (
    <Link
      to={`/trader/instruments/${instrument.id}`}
      className="group flex flex-col gap-4 px-5 py-5 transition hover:bg-slate-50 lg:flex-row lg:items-center lg:justify-between"
    >

      {/* Instrument Information */}

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
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClass}`}
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


      {/* Right Side */}

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