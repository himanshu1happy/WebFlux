import { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  ClipboardCheck,
  RefreshCw,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";

import { authFetch, formatDate } from "../../auth";

function Inspections() {
  const [applications, setApplications] = useState([]);
  const [instruments, setInstruments] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------
  // Load applications + instruments
  // --------------------------------
  useEffect(() => {
    let active = true;
    Promise.all([
      authFetch("/api/applications"),
      authFetch("/api/instruments"),
    ])
      .then(([applicationResponse, instrumentResponse]) => {
        if (!active) return;
        setApplications(applicationResponse.data || []);
        setInstruments(instrumentResponse.data || []);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Failed to load inspections:", err);
        setError(err.message || "Failed to load inspection data.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const refreshData = () => {
    setLoading(true);
    setError("");
    Promise.all([
      authFetch("/api/applications"),
      authFetch("/api/instruments"),
    ])
      .then(([applicationResponse, instrumentResponse]) => {
        setApplications(applicationResponse.data || []);
        setInstruments(instrumentResponse.data || []);
      })
      .catch((err) => {
        console.error("Failed to load inspections:", err);
        setError(err.message || "Failed to load inspection data.");
      })
      .finally(() => setLoading(false));
  };

  // --------------------------------
  // Create lookup for instruments
  // --------------------------------
  const instrumentMap = useMemo(() => {
    const map = {};

    instruments.forEach((instrument) => {
      map[instrument.instrumentId] = instrument;
    });

    return map;
  }, [instruments]);

  // --------------------------------
  // Convert applications into
  // inspection records
  // --------------------------------
  const inspectionData = useMemo(() => {
    return applications.flatMap((application) => {
      return (application.instruments || []).map(
        (applicationInstrument, index) => {
          const instrument =
            instrumentMap[applicationInstrument.instrumentId];

          return {
            id: `${application.applicationId}-${index + 1}`,

            applicationId: application.applicationId,

            instrumentId:
              applicationInstrument.instrumentId,

            trader: application.applicant,

            applicationType:
              application.applicationType,

            status: applicationInstrument.inspectionCompleted
              ? "Inspection Completed"
              : application.status,

            submittedAt:
              application.submittedAt ||
              application.createdAt,

            location:
              instrument?.installationLocation ||
              "Location not available",

            instrumentType:
              instrument?.instrumentType ||
              "Instrument details unavailable",

            manufacturer:
              instrument?.manufacturer || "",

            model:
              instrument?.model || "",

            serialNumber:
              instrument?.serialNumber || "",
          };
        }
      );
    });
  }, [applications, instrumentMap]);

  // --------------------------------
  // Search + status filter
  // --------------------------------
  const filteredInspections = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return inspectionData.filter((inspection) => {
      const matchesSearch =
        !searchText ||
        inspection.applicationId
          .toLowerCase()
          .includes(searchText) ||
        inspection.instrumentId
          .toLowerCase()
          .includes(searchText) ||
        inspection.trader
          .toLowerCase()
          .includes(searchText) ||
        inspection.instrumentType
          .toLowerCase()
          .includes(searchText) ||
        inspection.serialNumber
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        status === "All" ||
        inspection.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [inspectionData, search, status]);

  // --------------------------------
  // Status styling
  // --------------------------------
  const getStatusStyle = (currentStatus) => {
    switch (currentStatus) {
      case "Submitted":
        return "bg-slate-100 text-slate-700";

      case "Assigned":
        return "bg-blue-100 text-blue-700";

      case "Inspection Scheduled":
        return "bg-amber-100 text-amber-700";

      case "Inspection Completed":
        return "bg-purple-100 text-purple-700";

      case "Approved":
        return "bg-green-100 text-green-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="text-2xl font-semibold text-[#1F2933]">
            Inspections
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            View and manage verification requests requiring
            field inspection.
          </p>
        </div>

        <button
          onClick={refreshData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-[#D9E0E5] bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />

          Refresh
        </button>

      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-5">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <p className="text-sm">
              {error}
            </p>

            <button
              onClick={refreshData}
              className="text-sm font-medium hover:underline"
            >
              Try again
            </button>

          </div>

        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-[#D9E0E5] rounded-xl p-4 mb-5">

        <div className="flex flex-col md:flex-row gap-3">

          {/* Search */}
          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search application, instrument ID, trader..."
              className="w-full pl-10 pr-4 py-3 border border-[#D9E0E5] rounded-lg text-sm outline-none focus:border-[#164A63]"
            />

          </div>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="md:w-56 px-4 py-3 border border-[#D9E0E5] rounded-lg text-sm bg-white outline-none focus:border-[#164A63]"
          >
            <option value="All">
              All Status
            </option>

            <option value="Submitted">
              Submitted
            </option>

            <option value="Assigned">
              Assigned
            </option>

            <option value="Inspection Scheduled">
              Inspection Scheduled
            </option>

            <option value="Inspection Completed">
              Inspection Completed
            </option>

            <option value="Approved">
              Approved
            </option>

            <option value="Rejected">
              Rejected
            </option>
          </select>

        </div>

      </div>

      {/* Inspection list */}
      <div className="bg-white border border-[#D9E0E5] rounded-xl overflow-hidden">

        {/* List header */}
        <div className="p-5 border-b border-[#D9E0E5]">

          <div className="flex items-center justify-between gap-3">

            <div className="flex items-center gap-2">

              <ClipboardCheck
                size={19}
                className="text-[#164A63]"
              />

              <h2 className="font-semibold text-[#1F2933]">
                {loading
                  ? "Loading inspections..."
                  : `${filteredInspections.length} ${
                      filteredInspections.length === 1
                        ? "Inspection"
                        : "Inspections"
                    }`}
              </h2>

            </div>

            {!loading && (
              <span className="text-xs text-slate-500">
                {applications.length} application
                {applications.length !== 1 ? "s" : ""}
              </span>
            )}

          </div>

        </div>

        {/* Loading */}
        {loading && (
          <div className="p-12 text-center">

            <RefreshCw
              size={23}
              className="animate-spin mx-auto text-[#164A63]"
            />

            <p className="text-sm text-slate-500 mt-3">
              Loading verification requests...
            </p>

          </div>
        )}

        {/* Empty */}
        {!loading && filteredInspections.length === 0 && (
          <div className="p-12 text-center">

            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center">

              <FileText
                size={22}
                className="text-slate-500"
              />

            </div>

            <h3 className="font-medium text-[#1F2933] mt-4">
              No inspections found
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Try changing your search or status filter.
            </p>

          </div>
        )}

        {/* Results */}
        {!loading && filteredInspections.length > 0 && (
          <div className="divide-y divide-[#D9E0E5]">

            {filteredInspections.map((inspection) => (

              <div
                key={inspection.id}
                className="p-5 hover:bg-slate-50 transition"
              >

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                  {/* Main information */}
                  <div className="flex-1 min-w-0">

                    <div className="flex flex-wrap items-center gap-2">

                      <h3 className="font-semibold text-[#1F2933]">
                        {inspection.applicationId}
                      </h3>

                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusStyle(
                          inspection.status
                        )}`}
                      >
                        {inspection.status}
                      </span>

                    </div>

                    <p className="text-sm text-slate-700 mt-2">
                      {inspection.instrumentId}
                      {" — "}
                      {inspection.instrumentType}
                    </p>

                    {inspection.serialNumber && (
                      <p className="text-xs text-slate-500 mt-1">
                        Serial No: {inspection.serialNumber}
                      </p>
                    )}

                    <p className="text-sm text-slate-500 mt-1">
                      Trader: {inspection.trader}
                    </p>

                    <div className="flex items-start gap-1 text-sm text-slate-500 mt-2">

                      <MapPin
                        size={15}
                        className="mt-0.5 flex-shrink-0"
                      />

                      <span>
                        {inspection.location}
                      </span>

                    </div>

                  </div>

                  {/* Date + action */}
                  <div className="flex items-center justify-between lg:justify-end gap-5">

                    <div className="text-right hidden sm:block">

                      <p className="text-xs text-slate-500">
                        Request Date
                      </p>

                      <p className="text-sm font-medium mt-1">
                        {formatDate(inspection.submittedAt)}
                      </p>

                    </div>

                    <Link
                      to={`/officer/inspections/${inspection.applicationId}?instrumentId=${encodeURIComponent(inspection.instrumentId)}`}
                      className="px-4 py-2.5 bg-[#164A63] text-white rounded-lg text-sm font-medium hover:bg-[#123D52] transition"
                    >
                      Open
                    </Link>

                  </div>

                </div>

              </div>

            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default Inspections;