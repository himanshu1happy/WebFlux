import { useEffect, useState } from "react";
import {
  FileCheck2,
  Download,
  Eye,
  CheckCircle2,
  Clock3,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";

import { authFetch, formatDate } from "../../auth";

function getCertificateStatus(certificate) {
  if (
    certificate.validUntil &&
    new Date(certificate.validUntil) < new Date()
  ) {
    return "Expired";
  }

  return certificate.status || "Valid";
}

function getStatusClasses(status) {
  if (status === "Valid") {
    return "bg-green-100 text-green-700";
  }

  if (status === "Expired") {
    return "bg-red-100 text-red-700";
  }

  if (status === "Revoked") {
    return "bg-slate-100 text-slate-700";
  }

  return "bg-yellow-100 text-yellow-700";
}

function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await authFetch(
        "/api/certificates"
      );

      setCertificates(response.data || []);
    } catch (err) {
      console.error(
        "Failed to load certificates:",
        err
      );

      setError(
        err.message ||
          "Failed to load certificates."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="text-2xl font-semibold text-[#1F2933]">
            My Certificates
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            View certificates associated with your
            verified instruments.
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
        <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4">

          <div className="flex items-center gap-3 text-red-700">

            <AlertCircle size={18} />

            <p className="text-sm">
              {error}
            </p>

          </div>

        </div>
      )}

      {/* Certificate container */}
      <div className="bg-white border border-[#D9E0E5] rounded-xl overflow-hidden">

        {/* Header */}
        <div className="p-5 border-b border-[#D9E0E5] flex items-center gap-3">

          <FileCheck2
            size={20}
            className="text-[#164A63]"
          />

          <div>
            <h2 className="font-semibold text-[#1F2933]">
              Digital Certificates
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              Certificates issued after successful
              instrument verification.
            </p>
          </div>

        </div>

        {/* Loading */}
        {loading && (
          <div className="p-12 text-center">

            <RefreshCw
              size={25}
              className="mx-auto animate-spin text-[#164A63]"
            />

            <p className="text-sm text-slate-500 mt-3">
              Loading certificates...
            </p>

          </div>
        )}

        {/* Empty */}
        {!loading &&
          certificates.length === 0 && (
            <div className="p-12 text-center">

              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center">

                <FileCheck2
                  size={22}
                  className="text-slate-500"
                />

              </div>

              <h3 className="font-medium text-[#1F2933] mt-4">
                No certificates found
              </h3>

              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                Certificates will appear here after
                one of your instruments successfully
                completes verification.
              </p>

            </div>
          )}

        {/* Certificate list */}
        {!loading &&
          certificates.length > 0 && (
            <div className="divide-y divide-[#D9E0E5]">

              {certificates.map(
                (certificate) => {
                  const status =
                    getCertificateStatus(
                      certificate
                    );

                  return (
                    <div
                      key={
                        certificate.certificateNumber
                      }
                      className="p-5 hover:bg-slate-50 transition"
                    >

                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                        {/* Certificate information */}
                        <div className="flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="font-semibold text-[#1F2933]">
                              {
                                certificate.certificateNumber
                              }
                            </h3>

                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusClasses(
                                status
                              )}`}
                            >

                              {status ===
                                "Valid" && (
                                <CheckCircle2
                                  size={13}
                                />
                              )}

                              {status ===
                                "Expired" && (
                                <Clock3
                                  size={13}
                                />
                              )}

                              {status}

                            </span>

                          </div>

                          <p className="text-sm text-slate-700 mt-2">
                            {
                              certificate.instrumentId
                            }
                          </p>

                          <p className="text-sm text-slate-500 mt-1">
                            {
                              certificate.instrumentType
                            }
                          </p>

                          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-xs text-slate-500">

                            <span>
                              Issued:{" "}
                              {formatDate(
                                certificate.issuedAt
                              )}
                            </span>

                            <span>
                              Valid until:{" "}
                              {formatDate(
                                certificate.validUntil
                              )}
                            </span>

                          </div>

                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">

                          <Link
                            to={`/certificate/${encodeURIComponent(
                              certificate.instrumentId
                            )}`}
                            className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#D9E0E5] rounded-lg text-sm font-medium text-[#164A63] hover:bg-white"
                          >
                            <Eye size={16} />
                            View
                          </Link>

                          <button
                            type="button"
                            disabled
                            title="PDF generation will be connected next"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#164A63] text-white rounded-lg text-sm font-medium opacity-60 cursor-not-allowed"
                          >
                            <Download size={16} />
                            Download
                          </button>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

      </div>

      {/* Information */}
      <div className="mt-5 bg-blue-50 border border-blue-200 rounded-xl p-4">

        <div className="flex items-start gap-3">

          <FileCheck2
            size={19}
            className="text-blue-700 mt-0.5 flex-shrink-0"
          />

          <div>

            <p className="text-sm font-medium text-blue-900">
              Digital certificate
            </p>

            <p className="text-sm text-blue-800 mt-1">
              Each successful verification creates a
              unique certificate number and validity
              period linked to the instrument's digital
              verification history.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Certificates;