import { useEffect, useMemo, useState } from "react";
import {
  FileCheck2,
  Eye,
  CheckCircle2,
  Clock3,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import { authFetch, formatDate } from "../../auth";

function Certificates() {
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await authFetch(
        "/api/instruments"
      );

      setInstruments(response.data || []);
    } catch (err) {
      console.error(
        "Failed to load certificates:",
        err
      );

      setError(
        err.message ||
          "Failed to load verification records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  /*
   * Only show instruments that have actually been
   * verified through the officer inspection workflow.
   */
  const verifiedInstruments = useMemo(() => {
    return instruments
      .filter(
        (instrument) =>
          instrument.status === "Verified"
      )
      .sort(
        (a, b) =>
          new Date(b.lastVerifiedAt || 0) -
          new Date(a.lastVerifiedAt || 0)
      );
  }, [instruments]);

  const getLatestVerification = (instrument) => {
    if (
      !instrument.verificationHistory ||
      instrument.verificationHistory.length === 0
    ) {
      return null;
    }

    return [
      ...instrument.verificationHistory,
    ]
      .filter(
        (item) =>
          item.result === "Passed"
      )
      .sort(
        (a, b) =>
          new Date(b.verificationDate) -
          new Date(a.verificationDate)
      )[0];
  };

  return (
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="text-2xl font-semibold text-[#1F2933]">
            Digital Certificates
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            View instruments that have successfully completed
            verification.
          </p>
        </div>

        <button
          onClick={loadCertificates}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-[#D9E0E5] bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={
              loading ? "animate-spin" : ""
            }
          />

          Refresh
        </button>

      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-5">

          <div className="flex items-center gap-3">

            <AlertCircle size={18} />

            <p className="text-sm">
              {error}
            </p>

          </div>

        </div>
      )}

      {/* Main card */}
      <div className="bg-white border border-[#D9E0E5] rounded-xl overflow-hidden">

        {/* Header */}
        <div className="p-5 border-b border-[#D9E0E5]">

          <div className="flex items-center justify-between gap-3">

            <div className="flex items-center gap-2">

              <FileCheck2
                size={20}
                className="text-[#164A63]"
              />

              <div>

                <h2 className="font-semibold text-[#1F2933]">
                  Verified Instruments
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  {loading
                    ? "Loading..."
                    : `${verifiedInstruments.length} verified instrument${
                        verifiedInstruments.length !==
                        1
                          ? "s"
                          : ""
                      }`}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* Loading */}
        {loading && (
          <div className="p-12 text-center">

            <RefreshCw
              size={25}
              className="animate-spin mx-auto text-[#164A63]"
            />

            <p className="text-sm text-slate-500 mt-3">
              Loading verification records...
            </p>

          </div>
        )}

        {/* Empty */}
        {!loading &&
          verifiedInstruments.length === 0 && (
            <div className="p-12 text-center">

              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center">

                <FileCheck2
                  size={22}
                  className="text-slate-500"
                />

              </div>

              <h3 className="font-medium text-[#1F2933] mt-4">
                No verified instruments
              </h3>

              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                Certificates will appear here after an
                instrument successfully completes field
                verification.
              </p>

            </div>
          )}

        {/* Records */}
        {!loading &&
          verifiedInstruments.length > 0 && (
            <div className="divide-y divide-[#D9E0E5]">

              {verifiedInstruments.map(
                (instrument) => {
                  const verification =
                    getLatestVerification(
                      instrument
                    );

                  return (
                    <div
                      key={
                        instrument.instrumentId
                      }
                      className="p-5 hover:bg-slate-50 transition"
                    >

                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                        {/* Information */}
                        <div className="flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="font-semibold text-[#1F2933]">
                              {
                                instrument.instrumentId
                              }
                            </h3>

                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">

                              <CheckCircle2
                                size={13}
                              />

                              Verified
                            </span>

                          </div>

                          <p className="text-sm text-slate-700 mt-2">
                            {
                              instrument.instrumentType
                            }

                            {instrument.manufacturer &&
                              ` — ${instrument.manufacturer}`}

                            {instrument.model &&
                              ` ${instrument.model}`}
                          </p>

                          <p className="text-sm text-slate-500 mt-1">
                            Registered Owner:{" "}
                            {instrument.currentOwner ||
                              "Not available"}
                          </p>

                          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500 mt-3">

                            <span>
                              Verified:{" "}
                              {formatDate(
                                instrument.lastVerifiedAt
                              )}
                            </span>

                            {verification?.officerName && (
                              <span>
                                Officer:{" "}
                                {
                                  verification.officerName
                                }
                              </span>
                            )}

                          </div>

                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">

                          <Link
                            to={`/officer/inspections/${instrument.instrumentId}`}
                            className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#D9E0E5] rounded-lg text-sm font-medium text-[#164A63] hover:bg-slate-50"
                          >
                            <Eye size={16} />
                            View Record
                          </Link>

                          <Link
                            to={`/verify-instrument?instrumentId=${encodeURIComponent(
                              instrument.instrumentId
                            )}`}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#164A63] text-white rounded-lg text-sm font-medium hover:bg-[#123D52]"
                          >
                            <FileCheck2 size={16} />
                            Verify
                          </Link>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

      </div>

      {/* Certificate generation notice */}
      <div className="mt-5 bg-blue-50 border border-blue-200 rounded-xl p-4">

        <div className="flex items-start gap-3">

          <Clock3
            size={19}
            className="text-blue-700 mt-0.5 flex-shrink-0"
          />

          <div>

            <p className="text-sm font-medium text-blue-900">
              Digital certificate generation
            </p>

            <p className="text-sm text-blue-800 mt-1">
              Verification results are currently stored
              in the instrument's verification history.
              PDF certificate generation, certificate
              numbering and downloadable signed certificates
              will be connected in the certificate workflow.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Certificates;