import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShieldCheck,
  FileCheck2,
  CheckCircle2,
  XCircle,
  MapPin,
  CalendarDays,
  User,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  QrCode,
  Printer,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

import API_URL from "../../api";

function formatDate(date) {
  if (!date) return "Not available";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Certificate() {
  const { instrumentId } = useParams();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCertificate = useCallback(async () => {
      // ---------------------------------------------
      // Get instrument
      // ---------------------------------------------

      const instrumentResponse = await fetch(
        `${API_URL}/api/instruments/public/${encodeURIComponent(instrumentId)}`
      );

      const instrumentData = await instrumentResponse
        .json()
        .catch(() => ({}));

      if (!instrumentResponse.ok) {
        throw new Error(
          instrumentData.message || "Instrument not found."
        );
      }

      const instrument = instrumentData.data;

      if (!instrument?.certificateNumber) {
        throw new Error(
          "This instrument does not have a digital certificate."
        );
      }

      // ---------------------------------------------
      // Get public certificate
      // ---------------------------------------------

      const certificateResponse = await fetch(
        `${API_URL}/api/certificates/public/${encodeURIComponent(
          instrument.certificateNumber
        )}`
      );

      const certificateData = await certificateResponse
        .json()
        .catch(() => ({}));

      if (!certificateResponse.ok) {
        throw new Error(
          certificateData.message ||
            "Certificate could not be verified."
        );
      }

      return certificateData.data;
  }, [instrumentId]);

  useEffect(() => {
    let active = true;
    loadCertificate()
      .then((data) => {
        if (active) setCertificate(data);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Certificate loading error:", err);
        setError(err.message || "Unable to load certificate.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadCertificate]);

  // ---------------------------------------------
  // Print / Save as PDF
  // ---------------------------------------------

  const handlePrint = () => {
    window.print();
  };

  // ---------------------------------------------
  // Certificate status
  // ---------------------------------------------

  const isValid = certificate?.status === "Valid";

  // ---------------------------------------------
  // Public QR verification URL
  // ---------------------------------------------

  const verificationUrl = certificate
    ? `${window.location.origin}/verify-instrument?certificate=${encodeURIComponent(
        certificate.certificateNumber
      )}`
    : "";

  return (
    <div className="min-h-screen bg-[#F5F7F8] print:bg-white">

      {/* ==========================================
          HEADER
      ========================================== */}

      <header className="bg-white border-b border-[#D9E0E5] print:hidden">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 bg-[#164A63] rounded-lg flex items-center justify-center">
              <ShieldCheck
                size={20}
                className="text-white"
              />
            </div>

            <div>
              <h1 className="font-semibold text-[#1F2933]">
                WebFlux
              </h1>

              <p className="text-xs text-slate-500">
                Digital Verification Certificate
              </p>
            </div>

          </div>

          <Link
            to="/verify-instrument"
            className="text-sm text-[#164A63] hover:underline"
          >
            Verify another instrument
          </Link>

        </div>
      </header>

      {/* ==========================================
          MAIN
      ========================================== */}

      <main className="max-w-4xl mx-auto px-5 py-8 print:max-w-none print:px-0 print:py-0">

        {/* Back button */}
        <div className="print:hidden">
          <Link
            to="/verify-instrument"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#164A63] mb-5"
          >
            <ArrowLeft size={16} />
            Back to verification
          </Link>
        </div>

        {/* ========================================
            LOADING
        ======================================== */}

        {loading && (
          <div className="bg-white border border-[#D9E0E5] rounded-xl p-12 text-center">

            <RefreshCw
              size={26}
              className="mx-auto animate-spin text-[#164A63]"
            />

            <p className="text-sm text-slate-500 mt-3">
              Loading digital certificate...
            </p>

          </div>
        )}

        {/* ========================================
            ERROR
        ======================================== */}

        {!loading && error && (
          <div className="bg-white border border-red-200 rounded-xl p-8">

            <div className="flex items-start gap-3">

              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">

                <AlertCircle
                  size={20}
                  className="text-red-600"
                />

              </div>

              <div>
                <h2 className="font-semibold text-red-800">
                  Certificate unavailable
                </h2>

                <p className="text-sm text-red-700 mt-1">
                  {error}
                </p>
              </div>

            </div>

          </div>
        )}

        {/* ========================================
            CERTIFICATE
        ======================================== */}

        {!loading && !error && certificate && (
          <div
            id="certificate"
            className="bg-white border border-[#D9E0E5] rounded-xl overflow-hidden print:border print:border-slate-300 print:rounded-none"
          >

            {/* ======================================
                CERTIFICATE HEADER
            ====================================== */}

            <div className="p-6 sm:p-8 border-b border-[#D9E0E5]">

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">

                <div>

                  <div className="flex items-center gap-2">

                    <FileCheck2
                      size={22}
                      className="text-[#164A63]"
                    />

                    <p className="text-sm font-medium text-[#164A63]">
                      DIGITAL VERIFICATION CERTIFICATE
                    </p>

                  </div>

                  <h2 className="text-2xl font-semibold text-[#1F2933] mt-3">
                    {certificate.certificateNumber}
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    WebFlux Digital Instrument
                    Verification System
                  </p>

                </div>

                <div
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    isValid
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >

                  {isValid ? (
                    <CheckCircle2 size={17} />
                  ) : (
                    <XCircle size={17} />
                  )}

                  {certificate.status}

                </div>

              </div>

            </div>

            {/* ======================================
                INSTRUMENT DETAILS
            ====================================== */}

            <div className="p-6 sm:p-8">

              <h3 className="font-semibold text-[#1F2933] mb-5">
                Instrument Identity
              </h3>

              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">

                <div>
                  <p className="text-xs text-slate-500">
                    Instrument ID
                  </p>

                  <p className="text-sm font-semibold mt-1">
                    {certificate.instrumentId}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Instrument Type
                  </p>

                  <p className="text-sm font-medium mt-1">
                    {certificate.instrumentType}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Trade Category
                  </p>

                  <p className="text-sm font-medium mt-1">
                    {certificate.tradeCategory ||
                      "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Manufacturer
                  </p>

                  <p className="text-sm font-medium mt-1">
                    {certificate.manufacturer}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Model
                  </p>

                  <p className="text-sm font-medium mt-1">
                    {certificate.model}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Serial Number
                  </p>

                  <p className="text-sm font-medium mt-1">
                    {certificate.serialNumber}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Capacity
                  </p>

                  <p className="text-sm font-medium mt-1">
                    {certificate.capacity}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Accuracy Class
                  </p>

                  <p className="text-sm font-medium mt-1">
                    {certificate.accuracyClass ||
                      "Not available"}
                  </p>
                </div>

              </div>

              {/* ====================================
                  CURRENT REGISTRATION
              ==================================== */}

              <div className="border-t border-[#D9E0E5] mt-7 pt-7">

                <h3 className="font-semibold text-[#1F2933] mb-5">
                  Current Registration
                </h3>

                <div className="grid sm:grid-cols-2 gap-5">

                  <div className="flex gap-3">

                    <User
                      size={18}
                      className="text-[#164A63] mt-0.5"
                    />

                    <div>

                      <p className="text-xs text-slate-500">
                        Current Owner
                      </p>

                      <p className="text-sm font-medium mt-1">
                        {certificate.owner}
                      </p>

                    </div>

                  </div>

                  <div className="flex gap-3">

                    <MapPin
                      size={18}
                      className="text-[#164A63] mt-0.5"
                    />

                    <div>

                      <p className="text-xs text-slate-500">
                        Registered Location
                      </p>

                      <p className="text-sm font-medium mt-1">
                        {certificate.location}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* ====================================
                  VERIFICATION DETAILS
              ==================================== */}

              <div className="border-t border-[#D9E0E5] mt-7 pt-7">

                <h3 className="font-semibold text-[#1F2933] mb-5">
                  Verification Details
                </h3>

                <div className="grid sm:grid-cols-2 gap-5">

                  <div className="flex gap-3">

                    <CalendarDays
                      size={18}
                      className="text-[#164A63] mt-0.5"
                    />

                    <div>

                      <p className="text-xs text-slate-500">
                        Verification Date
                      </p>

                      <p className="text-sm font-medium mt-1">
                        {formatDate(
                          certificate.verificationDate
                        )}
                      </p>

                    </div>

                  </div>

                  <div className="flex gap-3">

                    <User
                      size={18}
                      className="text-[#164A63] mt-0.5"
                    />

                    <div>

                      <p className="text-xs text-slate-500">
                        Verification Officer
                      </p>

                      <p className="text-sm font-medium mt-1">
                        {certificate.officerName ||
                          "Not available"}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* ====================================
                  VALIDITY
              ==================================== */}

              <div className="border-t border-[#D9E0E5] mt-7 pt-7">

                <div className="grid sm:grid-cols-2 gap-5">

                  <div>

                    <p className="text-xs text-slate-500">
                      Certificate Issued
                    </p>

                    <p className="text-sm font-semibold mt-1">
                      {formatDate(
                        certificate.issuedAt
                      )}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-slate-500">
                      Certificate Valid Until
                    </p>

                    <p className="text-sm font-semibold mt-1">
                      {formatDate(
                        certificate.validUntil
                      )}
                    </p>

                  </div>

                </div>

              </div>

              {/* ====================================
                  QR VERIFICATION
              ==================================== */}

              <div className="border-t border-[#D9E0E5] mt-7 pt-7">

                <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-slate-50 border border-[#D9E0E5] rounded-xl print:bg-white">

                  <div className="bg-white p-3 border border-[#D9E0E5] rounded-lg">

                    <QRCodeCanvas
                      value={verificationUrl}
                      size={150}
                      level="H"
                      includeMargin
                    />

                  </div>

                  <div className="text-center sm:text-left">

                    <div className="flex items-center justify-center sm:justify-start gap-2">

                      <QrCode
                        size={18}
                        className="text-[#164A63]"
                      />

                      <p className="font-medium text-[#1F2933]">
                        Public Verification QR
                      </p>

                    </div>

                    <p className="text-sm text-slate-500 mt-2">
                      Scan this QR code to verify
                      the authenticity and current
                      status of this certificate.
                    </p>

                    <p className="text-xs text-slate-400 mt-2 break-all">
                      {verificationUrl}
                    </p>

                  </div>

                </div>

              </div>

              {/* ====================================
                  PRINT BUTTON
              ==================================== */}

              <div className="mt-7 flex justify-center print:hidden">

                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#164A63] text-white rounded-lg text-sm font-medium hover:bg-[#123C50] transition shadow-sm"
                >

                  <Printer size={18} />

                  Print / Save as PDF

                </button>

              </div>

            </div>

            {/* ======================================
                FOOTER
            ====================================== */}

            <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-[#D9E0E5] print:bg-white">

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">

                <p className="text-xs text-slate-500">
                  WebFlux Digital Instrument
                  Verification System
                </p>

                <p className="text-xs text-slate-400">
                  Certificate:{" "}
                  {certificate.certificateNumber}
                </p>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* ==========================================
          PRINT STYLES
      ========================================== */}

      <style>
        {`
          @media print {

            @page {
              size: A4;
              margin: 12mm;
            }

            body {
              background: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            a {
              text-decoration: none !important;
            }

            #certificate {
              width: 100% !important;
              box-shadow: none !important;
            }
          }
        `}
      </style>

    </div>
  );
}

export default Certificate;