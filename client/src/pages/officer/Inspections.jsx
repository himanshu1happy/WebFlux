import { useEffect, useState } from "react";
import { Search, MapPin, ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";

import API_URL from "../../api";

function Inspections() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------
  // Authentication
  // --------------------------------
  const token = localStorage.getItem("token");

  // --------------------------------
  // Load applications from MongoDB
  // --------------------------------
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          throw new Error(
            "Authentication token missing. Please login again."
          );
        }

        const response = await fetch(
          `${API_URL}/api/applications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load applications"
          );
        }

        setApplications(data.data || []);
      } catch (err) {
        console.error("Failed to load inspections:", err);

        setError(
          err.message || "Failed to load inspections"
        );
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [token]);

  // --------------------------------
  // Convert applications into
  // officer inspection records
  // --------------------------------
  const inspectionData = applications.flatMap(
    (application) =>
      (application.instruments || []).map(
        (instrument, index) => ({
          id:
            application.applicationId +
            "-" +
            (index + 1),

          applicationId: application.applicationId,

          instrumentId: instrument.instrumentId,

          trader: application.applicant,

          date: application.submittedAt
            ? new Date(
                application.submittedAt
              ).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "Not available",

          status:
            application.status === "Submitted"
              ? "Pending"
              : application.status ===
                "Inspection Scheduled"
              ? "Scheduled"
              : application.status ===
                "Inspection Completed"
              ? "Completed"
              : application.status,

          location:
            "Location available in instrument record",
        })
      )
  );

  // --------------------------------
  // Search + filter
  // --------------------------------
  const filteredInspections =
    inspectionData.filter((inspection) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        inspection.id
          .toLowerCase()
          .includes(searchText) ||
        inspection.instrumentId
          .toLowerCase()
          .includes(searchText) ||
        inspection.trader
          .toLowerCase()
          .includes(searchText) ||
        inspection.applicationId
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        status === "All" ||
        inspection.status === status;

      return matchesSearch && matchesStatus;
    });

  return (
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-6">

        <h1 className="text-2xl font-semibold text-[#1F2933]">
          Inspections
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          View and manage verification requests requiring
          field inspection.
        </p>

      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-5 text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-[#D9E0E5] rounded-xl p-4 mb-5">

        <div className="flex flex-col md:flex-row gap-3">

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search application, instrument ID or trader..."
              className="w-full pl-10 pr-4 py-3 border border-[#D9E0E5] rounded-lg text-sm outline-none focus:border-[#164A63]"
            />

          </div>

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className="md:w-48 px-4 py-3 border border-[#D9E0E5] rounded-lg text-sm bg-white"
          >
            <option value="All">
              All Status
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Scheduled">
              Scheduled
            </option>

            <option value="Completed">
              Completed
            </option>
          </select>

        </div>

      </div>

      {/* Inspection list */}
      <div className="bg-white border border-[#D9E0E5] rounded-xl overflow-hidden">

        <div className="p-5 border-b border-[#D9E0E5]">

          <div className="flex items-center gap-2">

            <ClipboardCheck
              size={19}
              className="text-[#164A63]"
            />

            <h2 className="font-semibold">
              {loading
                ? "Loading inspections..."
                : `${filteredInspections.length} Inspections`}
            </h2>

          </div>

        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading verification requests...
          </div>
        ) : (
          <div className="divide-y divide-[#D9E0E5]">

            {filteredInspections.map(
              (inspection) => (

                <div
                  key={inspection.id}
                  className="p-5 hover:bg-slate-50 transition"
                >

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                    <div className="flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="font-semibold text-[#1F2933]">
                          {inspection.applicationId}
                        </h3>

                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            inspection.status ===
                            "Pending"
                              ? "bg-amber-100 text-amber-700"
                              : inspection.status ===
                                "Scheduled"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {inspection.status}
                        </span>

                      </div>

                      <p className="text-sm text-slate-700 mt-2">
                        {inspection.instrumentId}
                      </p>

                      <p className="text-sm text-slate-500 mt-1">
                        Trader:{" "}
                        {inspection.trader}
                      </p>

                      <div className="flex items-center gap-1 text-sm text-slate-500 mt-2">

                        <MapPin size={15} />

                        {inspection.location}

                      </div>

                    </div>

                    <div className="flex items-center gap-5">

                      <div className="text-right hidden sm:block">

                        <p className="text-xs text-slate-500">
                          Request Date
                        </p>

                        <p className="text-sm font-medium mt-1">
                          {inspection.date}
                        </p>

                      </div>

                      <Link
                        to={`/officer/inspections/${inspection.instrumentId}?applicationId=${inspection.applicationId}`}
                        className="px-4 py-2.5 bg-[#164A63] text-white rounded-lg text-sm font-medium hover:bg-[#123D52]"
                      >
                        Open
                      </Link>

                    </div>

                  </div>

                </div>

              )
            )}

            {filteredInspections.length === 0 && (
              <div className="p-10 text-center text-sm text-slate-500">
                No inspections found.
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default Inspections;