import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  Clock3,
  FileCheck,
  Loader2,
} from "lucide-react";

import { authFetch, formatDate } from "../../auth";


function Applications() {
  const [instruments, setInstruments] = useState([]);
  const [applications, setApplications] = useState([]);

  const [selected, setSelected] = useState([]);
  const [submittedApplication, setSubmittedApplication] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");


  // ======================================================
  // LOAD DATA
  // ======================================================

  useEffect(() => {
    let active = true;
    Promise.all([
      authFetch("/api/instruments"),
      authFetch("/api/applications"),
    ])
      .then(([instrumentResult, applicationResult]) => {
        if (!active) return;
        const instrumentList = Array.isArray(instrumentResult)
          ? instrumentResult
          : instrumentResult.data || instrumentResult.instruments || [];
        const applicationList = Array.isArray(applicationResult)
          ? applicationResult
          : applicationResult.data || applicationResult.applications || [];
        setInstruments(instrumentList);
        setApplications(applicationList);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Load applications page error:", err);
        setError(err.message || "Unable to load verification applications.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);


  // ======================================================
  // SELECT / UNSELECT
  // ======================================================

  const toggleInstrument = (instrumentId) => {
    setSelected((previous) =>
      previous.includes(instrumentId)
        ? previous.filter(
            (item) => item !== instrumentId
          )
        : [...previous, instrumentId]
    );
  };


  // ======================================================
  // SELECT ALL
  // ======================================================

  const selectAll = () => {
    if (
      selected.length === instruments.length
    ) {
      setSelected([]);
      return;
    }

    setSelected(
      instruments.map(
        (instrument) => instrument.instrumentId
      )
    );
  };


  // ======================================================
  // SUBMIT VERIFICATION REQUEST
  // ======================================================

  const submitRequest = async () => {
    if (selected.length === 0) {
      setError(
        "Please select at least one instrument."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSubmittedApplication(null);

      /*
       * Application ID is intentionally NOT generated
       * here.
       *
       * The backend should be the source of truth for
       * application IDs.
       */

      const response = await authFetch(
        "/api/applications",
        {
          method: "POST",

          body: JSON.stringify({
            instruments: selected.map(
              (instrumentId) => ({
                instrumentId,
              })
            ),

            applicationType:
              "Initial Verification",

            remarks:
              "Verification request submitted through WebFlux.",
          }),
        }
      );


      const createdApplication =
        response.data || response.application;


      if (!createdApplication) {
        throw new Error(
          "Application was created but no application data was returned."
        );
      }


      setApplications((previous) => [
        createdApplication,
        ...previous,
      ]);

      setSubmittedApplication(
        createdApplication
      );

      setSelected([]);

    } catch (err) {
      console.error(
        "Submit verification request error:",
        err
      );

      setError(
        err.message ||
          "Failed to submit verification request."
      );
    } finally {
      setSubmitting(false);
    }
  };


  // ======================================================
  // APPLICATION STATISTICS
  // ======================================================

  const totalApplications =
    applications.length;


  const pendingApplications =
    applications.filter((application) =>
      [
        "Submitted",
        "Assigned",
        "Inspection Scheduled",
      ].includes(application.status)
    ).length;


  const completedApplications =
    applications.filter((application) =>
      [
        "Approved",
        "Rejected",
        "Inspection Completed",
      ].includes(application.status)
    ).length;


  return (
    <div className="mx-auto max-w-6xl">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-6">

        <Link
          to="/trader/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#164A63]"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>


        <h1 className="text-2xl font-semibold text-[#1F2933]">
          Verification Applications
        </h1>


        <p className="mt-1 text-sm text-slate-500">
          Select one or more instruments and submit
          a verification request.
        </p>

      </div>


      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (

        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-sm text-red-700">
            {error}
          </p>


          <button
            type="button"
            onClick={() => setError("")}
            className="text-xs font-medium text-red-700 hover:underline"
          >
            Dismiss
          </button>

        </div>

      )}


      {/* ==================================================
          SUCCESS
      ================================================== */}

      {submittedApplication && (

        <div className="mb-5 flex gap-3 rounded-xl border border-green-200 bg-green-50 p-5">

          <CheckCircle2
            size={22}
            className="mt-0.5 shrink-0 text-green-600"
          />


          <div>

            <h3 className="font-semibold text-green-800">
              Verification request submitted
            </h3>


            <p className="mt-1 text-sm text-green-700">
              Your request has been created for{" "}
              {
                submittedApplication.instruments
                  ?.length || 0
              }{" "}
              instrument
              {(
                submittedApplication.instruments
                  ?.length || 0
              ) !== 1
                ? "s"
                : ""}
              .
            </p>


            <p className="mt-2 text-xs text-green-700">
              Application ID:{" "}
              <span className="font-semibold">
                {
                  submittedApplication.applicationId ||
                  "Generated by system"
                }
              </span>
            </p>

          </div>

        </div>

      )}


      {/* ==================================================
          APPLICATION STATISTICS
      ================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

        <StatCard
          icon={
            <FileCheck
              className="text-[#164A63]"
              size={22}
            />
          }
          label="Total Applications"
          value={totalApplications}
        />


        <StatCard
          icon={
            <Clock3
              className="text-amber-600"
              size={22}
            />
          }
          label="Pending"
          value={pendingApplications}
        />


        <StatCard
          icon={
            <CheckCircle2
              className="text-green-600"
              size={22}
            />
          }
          label="Completed"
          value={completedApplications}
        />

      </div>


      {/* ==================================================
          LOADING
      ================================================== */}

      {loading && (

        <div className="rounded-xl border border-[#D9E0E5] bg-white p-10 text-center">

          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">

            <Loader2
              size={18}
              className="animate-spin"
            />

            Loading verification data...

          </div>

        </div>

      )}


      {/* ==================================================
          NO INSTRUMENTS
      ================================================== */}

      {!loading &&
        instruments.length === 0 && (

          <div className="rounded-xl border border-[#D9E0E5] bg-white p-10 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-[#164A63]">
              <FileCheck size={22} />
            </div>


            <p className="mt-4 font-medium text-[#1F2933]">
              No instruments found
            </p>


            <p className="mt-1 text-sm text-slate-500">
              Register an instrument before
              submitting a verification request.
            </p>


            <Link
              to="/trader/instruments/add"
              className="mt-4 inline-flex rounded-md bg-[#164A63] px-4 py-2 text-sm font-medium text-white hover:bg-[#123D52]"
            >
              Register Instrument
            </Link>

          </div>

        )}


      {/* ==================================================
          SELECT INSTRUMENTS
      ================================================== */}

      {!loading &&
        instruments.length > 0 && (

          <div className="rounded-xl border border-[#D9E0E5] bg-white">

            {/* Header */}

            <div className="flex flex-col gap-3 border-b border-[#D9E0E5] p-5 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="font-semibold text-[#1F2933]">
                  Select Instruments
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selected.length} instrument
                  {selected.length !== 1
                    ? "s"
                    : ""}{" "}
                  selected
                </p>

              </div>


              <button
                type="button"
                onClick={selectAll}
                className="text-sm font-medium text-[#164A63] hover:underline"
              >
                {selected.length ===
                instruments.length
                  ? "Clear All"
                  : "Select All"}
              </button>

            </div>


            {/* Instrument list */}

            <div className="divide-y divide-[#D9E0E5]">

              {instruments.map((instrument) => {

                const isSelected =
                  selected.includes(
                    instrument.instrumentId
                  );


                const statusClass =
                  getStatusClass(
                    instrument.status
                  );


                return (

                  <div
                    key={
                      instrument.instrumentId
                    }
                    onClick={() =>
                      toggleInstrument(
                        instrument.instrumentId
                      )
                    }
                    className={`cursor-pointer p-5 transition ${
                      isSelected
                        ? "bg-slate-50"
                        : "hover:bg-slate-50"
                    }`}
                  >

                    <div className="flex items-start gap-4">

                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          toggleInstrument(
                            instrument.instrumentId
                          )
                        }
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                        className="mt-1 h-4 w-4 accent-[#164A63]"
                      />


                      <div className="flex-1">

                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

                          <div>

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="font-semibold text-[#1F2933]">
                                {
                                  instrument.instrumentId
                                }
                              </h3>


                              <span
                                className={`rounded-full px-2 py-1 text-xs ${statusClass}`}
                              >
                                {
                                  instrument.status ||
                                  "Pending Verification"
                                }
                              </span>

                            </div>


                            <p className="mt-1 text-sm text-slate-600">
                              {
                                instrument.instrumentType ||
                                "Instrument"
                              }
                            </p>

                          </div>


                          <span className="text-sm text-slate-500">
                            Serial:{" "}
                            {instrument.serialNumber ||
                              "Not available"}
                          </span>

                        </div>


                        <div className="mt-3 grid gap-1 text-sm text-slate-500 sm:grid-cols-2">

                          <p>
                            Location:{" "}
                            {instrument.installationLocation ||
                              "Not available"}
                          </p>


                          <p>
                            Valid until:{" "}
                            {instrument.validUntil
                              ? formatDate(
                                  instrument.validUntil
                                )
                              : "Not available"}
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                );

              })}

            </div>


            {/* Bottom action */}

            <div className="flex flex-col gap-4 border-t border-[#D9E0E5] p-5 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-sm text-slate-500">
                Selected instruments will be
                included in one verification
                application.
              </p>


              <button
                type="button"
                onClick={submitRequest}
                disabled={
                  submitting ||
                  selected.length === 0
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#164A63] px-5 py-3 text-sm font-medium text-white hover:bg-[#123D52] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {submitting ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={17} />
                )}


                {submitting
                  ? "Submitting..."
                  : "Submit Verification Request"}

              </button>

            </div>

          </div>

        )}

    </div>
  );
}


// ======================================================
// STAT CARD
// ======================================================

function StatCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-[#D9E0E5] bg-white p-5">

      <div className="flex items-center gap-3">

        {icon}

        <div>

          <p className="text-xs text-slate-500">
            {label}
          </p>

          <p className="text-xl font-semibold text-slate-900">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}


// ======================================================
// STATUS STYLE
// ======================================================

function getStatusClass(status) {
  switch (status) {
    case "Verified":
      return "bg-green-100 text-green-700";

    case "Due Soon":
      return "bg-amber-100 text-amber-700";

    case "Expired":
      return "bg-red-100 text-red-700";

    case "Suspended":
      return "bg-red-100 text-red-700";

    case "Pending Verification":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}


export default Applications;