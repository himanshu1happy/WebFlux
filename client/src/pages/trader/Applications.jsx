import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  Clock3,
  FileCheck,
} from "lucide-react";

function Applications() {
  const [instruments, setInstruments] = useState([]);
  const [applications, setApplications] = useState([]);

  const [selected, setSelected] = useState([]);
  const [submittedApplication, setSubmittedApplication] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------
  // Load instruments and applications
  // --------------------------------
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [instrumentResponse, applicationResponse] =
          await Promise.all([
            fetch("http://localhost:5000/api/instruments"),
            fetch("http://localhost:5000/api/applications"),
          ]);

        const instrumentData = await instrumentResponse.json();
        const applicationData = await applicationResponse.json();

        if (!instrumentResponse.ok) {
          throw new Error(
            instrumentData.message || "Failed to load instruments"
          );
        }

        if (!applicationResponse.ok) {
          throw new Error(
            applicationData.message || "Failed to load applications"
          );
        }

        setInstruments(instrumentData.data || []);
        setApplications(applicationData.data || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // --------------------------------
  // Select / unselect instrument
  // --------------------------------
  const toggleInstrument = (id) => {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  // --------------------------------
  // Select all
  // --------------------------------
  const selectAll = () => {
    if (selected.length === instruments.length) {
      setSelected([]);
    } else {
      setSelected(instruments.map((instrument) => instrument.instrumentId));
    }
  };

  // --------------------------------
  // Submit verification application
  // --------------------------------
  const submitRequest = async () => {
    if (selected.length === 0) {
      alert("Please select at least one instrument.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const applicationId = `APP-${Math.floor(
        100000 + Math.random() * 900000
      )}`;

      const response = await fetch(
        "http://localhost:5000/api/applications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            applicationId,

            // Temporary logged-in trader
            // We will replace this with real authentication later.
            applicant: "Rahul Traders",

            instruments: selected.map((instrumentId) => ({
              instrumentId,
            })),

            applicationType: "Initial Verification",

            status: "Submitted",

            remarks:
              "Verification request submitted through WebFlux.",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to submit verification request"
        );
      }

      // Add newly created application to the screen
      setApplications((previous) => [
        data.data,
        ...previous,
      ]);

      setSubmittedApplication(data.data);

      // Clear selection
      setSelected([]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------
  // Application statistics
  // --------------------------------
  const totalApplications = applications.length;

  const pendingApplications = applications.filter(
    (application) =>
      application.status === "Submitted" ||
      application.status === "Assigned" ||
      application.status === "Inspection Scheduled"
  ).length;

  const completedApplications = applications.filter(
    (application) =>
      application.status === "Approved" ||
      application.status === "Rejected" ||
      application.status === "Inspection Completed"
  ).length;

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <Link
          to="/trader/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#164A63] mb-4"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-semibold text-[#1F2933]">
          Verification Applications
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Select one or more instruments and submit a verification request.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Success message */}
      {submittedApplication && (
        <div className="mb-5 bg-green-50 border border-green-200 rounded-xl p-5 flex gap-3">
          <CheckCircle2
            size={22}
            className="text-green-600 mt-0.5"
          />

          <div>
            <h3 className="font-semibold text-green-800">
              Verification request submitted
            </h3>

            <p className="text-sm text-green-700 mt-1">
              Your request has been created for{" "}
              {submittedApplication.instruments.length} instrument
              {submittedApplication.instruments.length > 1
                ? "s"
                : ""}.
            </p>

            <p className="text-xs text-green-700 mt-2">
              Application ID:{" "}
              {submittedApplication.applicationId}
            </p>
          </div>
        </div>
      )}

      {/* Application status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <div className="bg-white border border-[#D9E0E5] rounded-xl p-5">
          <div className="flex items-center gap-3">
            <FileCheck
              className="text-[#164A63]"
              size={22}
            />

            <div>
              <p className="text-xs text-slate-500">
                Total Applications
              </p>

              <p className="text-xl font-semibold">
                {totalApplications}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#D9E0E5] rounded-xl p-5">
          <div className="flex items-center gap-3">
            <Clock3
              className="text-amber-600"
              size={22}
            />

            <div>
              <p className="text-xs text-slate-500">
                Pending
              </p>

              <p className="text-xl font-semibold">
                {pendingApplications}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#D9E0E5] rounded-xl p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2
              className="text-green-600"
              size={22}
            />

            <div>
              <p className="text-xs text-slate-500">
                Completed
              </p>

              <p className="text-xl font-semibold">
                {completedApplications}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Loading */}
      {loading ? (
        <div className="bg-white border border-[#D9E0E5] rounded-xl p-8 text-center text-slate-500">
          Loading instruments...
        </div>
      ) : instruments.length === 0 ? (
        <div className="bg-white border border-[#D9E0E5] rounded-xl p-8 text-center">
          <p className="font-medium text-[#1F2933]">
            No instruments found
          </p>

          <p className="text-sm text-slate-500 mt-1">
            Register an instrument before submitting a verification request.
          </p>
        </div>
      ) : (
        <>
          {/* Select instruments */}
          <div className="bg-white border border-[#D9E0E5] rounded-xl">

            <div className="p-5 border-b border-[#D9E0E5] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <div>
                <h2 className="font-semibold text-[#1F2933]">
                  Select Instruments
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {selected.length} instrument
                  {selected.length !== 1 ? "s" : ""} selected
                </p>
              </div>

              <button
                onClick={selectAll}
                className="text-sm font-medium text-[#164A63] hover:underline"
              >
                {selected.length === instruments.length
                  ? "Clear All"
                  : "Select All"}
              </button>

            </div>

            <div className="divide-y divide-[#D9E0E5]">

              {instruments.map((instrument) => {

                const isSelected = selected.includes(
                  instrument.instrumentId
                );

                return (
                  <div
                    key={instrument.instrumentId}
                    onClick={() =>
                      toggleInstrument(instrument.instrumentId)
                    }
                    className={`p-5 cursor-pointer transition ${
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

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">

                          <div>

                            <div className="flex items-center gap-2">

                              <h3 className="font-semibold text-[#1F2933]">
                                {instrument.instrumentId}
                              </h3>

                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  instrument.status === "Due Soon"
                                    ? "bg-amber-100 text-amber-700"
                                    : instrument.status === "Expired"
                                    ? "bg-red-100 text-red-700"
                                    : instrument.status === "Pending Verification"
                                    ? "bg-slate-100 text-slate-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {instrument.status}
                              </span>

                            </div>

                            <p className="text-sm text-slate-600 mt-1">
                              {instrument.instrumentType}
                            </p>

                          </div>

                          <span className="text-sm text-slate-500">
                            Serial: {instrument.serialNumber}
                          </span>

                        </div>

                        <p className="text-sm text-slate-500 mt-3">
                          Installation Location:{" "}
                          {instrument.installationLocation}
                        </p>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>

            {/* Bottom action */}
            <div className="p-5 border-t border-[#D9E0E5] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <p className="text-sm text-slate-500">
                Selected instruments will be included in one verification
                application.
              </p>

              <button
                onClick={submitRequest}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#164A63] text-white rounded-lg text-sm font-medium hover:bg-[#123D52] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Send size={17} />

                {submitting
                  ? "Submitting..."
                  : "Submit Verification Request"}
              </button>

            </div>

          </div>
        </>
      )}

    </div>
  );
}

export default Applications;