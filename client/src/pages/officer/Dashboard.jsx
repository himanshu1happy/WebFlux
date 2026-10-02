import { useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck,
  Clock3,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";

import { authFetch, formatDate, getUser } from "../../auth";

function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = getUser();

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [applicationResponse, instrumentResponse] = await Promise.all([
        authFetch("/api/applications"),
        authFetch("/api/instruments"),
      ]);

      setApplications(applicationResponse.data || []);
      setInstruments(instrumentResponse.data || []);
    } catch (err) {
      console.error("Officer dashboard error:", err);
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  /*
   * Application statuses:
   * Submitted
   * Assigned
   * Inspection Scheduled
   * Inspection Completed
   * Approved
   * Rejected
   */

  const stats = useMemo(() => {
    const assigned = applications.filter(
      (app) =>
        app.status === "Assigned" ||
        app.status === "Inspection Scheduled"
    ).length;

    const pending = applications.filter(
      (app) =>
        app.status === "Submitted" ||
        app.status === "Assigned" ||
        app.status === "Inspection Scheduled"
    ).length;

    const passed = applications.filter(
      (app) => app.status === "Approved"
    ).length;

    const failed = applications.filter(
      (app) => app.status === "Rejected"
    ).length;

    return {
      assigned,
      pending,
      passed,
      failed,
    };
  }, [applications]);

  const recentApplications = useMemo(() => {
    return [...applications]
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.submittedAt) -
          new Date(a.createdAt || a.submittedAt)
      )
      .slice(0, 5);
  }, [applications]);

  const getStatusStyle = (status) => {
    switch (status) {
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

  const getInstrumentCount = (application) => {
    return application.instruments?.length || 0;
  };

  return (
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="text-2xl font-semibold text-[#1F2933]">
            Officer Dashboard
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Welcome{user?.name ? `, ${user.name}` : ""}. Manage verification
            applications and inspection activities.
          </p>
        </div>

        <button
          onClick={loadDashboard}
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
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <p className="text-sm text-red-700">
              {error}
            </p>

            <button
              onClick={loadDashboard}
              className="text-sm font-medium text-red-700 hover:underline"
            >
              Try again
            </button>

          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">

        {/* Assigned */}
        <div className="bg-white border border-[#D9E0E5] rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Assigned Applications
              </p>

              <p className="text-2xl font-semibold mt-1 text-[#1F2933]">
                {loading ? "—" : stats.assigned}
              </p>
            </div>

            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <ClipboardCheck
                size={20}
                className="text-[#164A63]"
              />
            </div>

          </div>

        </div>

        {/* Pending */}
        <div className="bg-white border border-[#D9E0E5] rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Pending
              </p>

              <p className="text-2xl font-semibold mt-1 text-[#1F2933]">
                {loading ? "—" : stats.pending}
              </p>
            </div>

            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock3
                size={20}
                className="text-amber-600"
              />
            </div>

          </div>

        </div>

        {/* Approved */}
        <div className="bg-white border border-[#D9E0E5] rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Approved
              </p>

              <p className="text-2xl font-semibold mt-1 text-[#1F2933]">
                {loading ? "—" : stats.passed}
              </p>
            </div>

            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle2
                size={20}
                className="text-green-600"
              />
            </div>

          </div>

        </div>

        {/* Rejected */}
        <div className="bg-white border border-[#D9E0E5] rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Rejected
              </p>

              <p className="text-2xl font-semibold mt-1 text-[#1F2933]">
                {loading ? "—" : stats.failed}
              </p>
            </div>

            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <XCircle
                size={20}
                className="text-red-600"
              />
            </div>

          </div>

        </div>

      </div>

      {/* Overview */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">

          <div className="bg-white border border-[#D9E0E5] rounded-xl p-5">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <FileText
                  size={19}
                  className="text-slate-600"
                />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Total Applications
                </p>

                <p className="text-xl font-semibold text-[#1F2933]">
                  {applications.length}
                </p>
              </div>

            </div>

          </div>

          <div className="bg-white border border-[#D9E0E5] rounded-xl p-5">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <ClipboardCheck
                  size={19}
                  className="text-[#164A63]"
                />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Registered Instruments
                </p>

                <p className="text-xl font-semibold text-[#1F2933]">
                  {instruments.length}
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Recent Applications */}
      <div className="bg-white border border-[#D9E0E5] rounded-xl">

        <div className="p-5 border-b border-[#D9E0E5] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <div>
            <h2 className="font-semibold text-[#1F2933]">
              Recent Applications
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Verification applications requiring officer attention
            </p>
          </div>

          <Link
            to="/officer/inspections"
            className="text-sm font-medium text-[#164A63] flex items-center gap-1 hover:underline"
          >
            View All
            <ArrowRight size={15} />
          </Link>

        </div>

        {/* Loading */}
        {loading && (
          <div className="p-8 text-center">
            <RefreshCw
              size={22}
              className="animate-spin mx-auto text-[#164A63]"
            />

            <p className="text-sm text-slate-500 mt-3">
              Loading applications...
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && recentApplications.length === 0 && (
          <div className="p-10 text-center">

            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
              <ClipboardCheck
                size={22}
                className="text-slate-500"
              />
            </div>

            <h3 className="font-medium text-[#1F2933] mt-4">
              No applications yet
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Verification applications submitted by traders will appear here.
            </p>

          </div>
        )}

        {/* Applications */}
        {!loading && recentApplications.length > 0 && (
          <div className="divide-y divide-[#D9E0E5]">

            {recentApplications.map((application) => (

              <div
                key={application.applicationId}
                className="p-5 hover:bg-slate-50 transition"
              >

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                  {/* Application info */}
                  <div className="flex-1 min-w-0">

                    <div className="flex flex-wrap items-center gap-2 mb-2">

                      <span className="font-semibold text-[#1F2933]">
                        {application.applicationId}
                      </span>

                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusStyle(
                          application.status
                        )}`}
                      >
                        {application.status}
                      </span>

                    </div>

                    <p className="text-sm text-slate-700">
                      {application.applicationType}
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                      Trader: {application.applicant}
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                      {getInstrumentCount(application)} instrument
                      {getInstrumentCount(application) !== 1 ? "s" : ""}
                    </p>

                  </div>

                  {/* Date + action */}
                  <div className="flex items-center justify-between lg:justify-end gap-5">

                    <div className="text-right hidden sm:block">

                      <p className="text-xs text-slate-500">
                        Submitted
                      </p>

                      <p className="text-sm font-medium mt-1">
                        {formatDate(
                          application.submittedAt || application.createdAt
                        )}
                      </p>

                    </div>

                    <Link
                      to={`/officer/inspections/${application.applicationId}`}
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

export default Dashboard;