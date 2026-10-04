import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  MapPin,
  CalendarDays,
  User,
  FileCheck2,
  AlertCircle,
  Loader2,
} from "lucide-react";

import API_URL from "../../api";

function formatDate(date) {
  if (!date) return "Not available";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function VerifyInstrument() {
  const [searchParams] = useSearchParams();
  const queryValue =
    searchParams.get("certificate") ||
    searchParams.get("instrumentId") ||
    "";

  const [searchValue, setSearchValue] = useState(
    queryValue.toUpperCase()
  );
  const [instrument, setInstrument] = useState(null);
  const [loading, setLoading] = useState(Boolean(queryValue));
  const [error, setError] = useState("");

  const verifyValue = useCallback(async (value) => {
    const normalizedValue = value.trim().toUpperCase();

    if (!normalizedValue) {
      setError(
        "Please enter an Instrument ID or Certificate Number."
      );
      setInstrument(null);
      setLoading(false);
      return;
    }

    try {
      let response;

      // Certificate number
      if (normalizedValue.startsWith("CERT-")) {
        response = await fetch(
          `${API_URL}/api/certificates/public/${encodeURIComponent(
            normalizedValue
          )}`
        );
      }

      // Instrument ID
      else {
        response = await fetch(
          `${API_URL}/api/instruments/public/${encodeURIComponent(
            normalizedValue
          )}`
        );
      }

      const data = await response.json().catch(() => ({}));
      setSearchValue(normalizedValue);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Instrument or certificate could not be found."
        );
      }

      // ---------------------------------------------
      // Certificate search result
      // ---------------------------------------------

      if (normalizedValue.startsWith("CERT-")) {
        const certificate = data.data;

        setInstrument({
          id: certificate.instrumentId,
          type: certificate.instrumentType,
          tradeCategory: certificate.tradeCategory,
          manufacturer: certificate.manufacturer,
          model: certificate.model,
          serial: certificate.serialNumber,
          capacity: certificate.capacity,
          accuracyClass: certificate.accuracyClass,
          owner: certificate.owner,
          location: certificate.location,
          status: certificate.status,
          verified: data.verified,
          verifiedOn: certificate.verificationDate,
          validUntil: certificate.validUntil,
          certificate: certificate.certificateNumber,
          officer: certificate.officerName,
          result: certificate.result,
        });

        return;
      }

      // ---------------------------------------------
      // Instrument search result
      // ---------------------------------------------

      const item = data.data;

      const latestVerification =
        item.verificationHistory?.length
          ? [...item.verificationHistory].sort(
              (a, b) =>
                new Date(b.verificationDate) -
                new Date(a.verificationDate)
            )[0]
          : null;

      setInstrument({
        id: item.instrumentId,
        type: item.instrumentType,
        tradeCategory: item.tradeCategory,
        manufacturer: item.manufacturer,
        model: item.model,
        serial: item.serialNumber,
        capacity: item.capacity,
        accuracyClass: item.accuracyClass,
        owner: item.currentOwner,
        location: item.installationLocation,
        status: item.status,
        verified: item.status === "Verified",
        verifiedOn: item.lastVerifiedAt,
        validUntil: item.validUntil,
        certificate:
          item.certificateNumber ||
          latestVerification?.certificateNumber ||
          null,
        officer: latestVerification?.officerName || null,
        result: latestVerification?.result || null,
      });
    } catch (err) {
      console.error("Verification error:", err);

      setError(
        err.message || "Unable to verify instrument."
      );

      setInstrument(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // --------------------------------------------------
  // Automatically verify from URL parameters
  // --------------------------------------------------
  useEffect(() => {
    if (queryValue) {
      // Verification updates state after the public lookup request resolves.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void verifyValue(queryValue);
    }
  }, [queryValue, verifyValue]);
  

  // --------------------------------------------------
  // Form submit
  // --------------------------------------------------

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInstrument(null);
    verifyValue(searchValue);
  };

  const isVerified =
    instrument?.verified === true ||
    instrument?.status === "Verified" ||
    instrument?.status === "Valid";

  return (
    <div className="min-h-screen bg-[#F5F7F8]">

      {/* Header */}
      <header className="bg-white border-b border-[#D9E0E5]">

        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center gap-3">

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
              Instrument Verification
            </p>
          </div>

        </div>

      </header>

      <main className="max-w-3xl mx-auto px-5 py-10">

        {/* Search */}
        <div className="bg-white border border-[#D9E0E5] rounded-xl p-6">

          <div className="text-center mb-7">

            <div className="w-12 h-12 mx-auto bg-[#E8F0F4] rounded-full flex items-center justify-center">

              <Search
                size={23}
                className="text-[#164A63]"
              />

            </div>

            <h1 className="text-2xl font-semibold text-[#1F2933] mt-4">
              Verify Instrument
            </h1>

            <p className="text-sm text-slate-500 mt-2">
              Verify the current verification status
              and certificate information of an
              instrument.
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3"
          >

            <input
              value={searchValue}
              onChange={(e) =>
                setSearchValue(e.target.value)
              }
              placeholder="Instrument ID or Certificate Number"
              className="flex-1 px-4 py-3 border border-[#D9E0E5] rounded-lg text-sm outline-none focus:border-[#164A63]"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 bg-[#164A63] text-white rounded-lg text-sm font-medium hover:bg-[#123D52] disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >

              {loading ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Verifying...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Verify
                </>
              )}

            </button>

          </form>

          <p className="text-xs text-slate-400 mt-3">
            Enter an Instrument ID such as
            LM-WM-00124 or a certificate number such
            as CERT-2026-AB12CD34.
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4">

            <div className="flex items-start gap-3 text-red-700">

              <AlertCircle
                size={19}
                className="mt-0.5 flex-shrink-0"
              />

              <div>

                <p className="text-sm font-medium">
                  Verification failed
                </p>

                <p className="text-sm mt-1">
                  {error}
                </p>

              </div>

            </div>

          </div>
        )}

        {/* Result */}
        {instrument && (
          <div className="bg-white border border-[#D9E0E5] rounded-xl mt-5 overflow-hidden">

            {/* Result header */}
            <div className="p-6 border-b border-[#D9E0E5]">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="text-xs text-slate-500">
                    Digital Instrument ID
                  </p>

                  <h2 className="text-xl font-semibold mt-1">
                    {instrument.id}
                  </h2>

                  {instrument.certificate && (
                    <p className="text-sm text-slate-500 mt-1">
                      Certificate:{" "}
                      <span className="font-medium text-slate-700">
                        {instrument.certificate}
                      </span>
                    </p>
                  )}

                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                    isVerified
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >

                  {isVerified ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <XCircle size={14} />
                  )}

                  {isVerified
                    ? "Verified"
                    : instrument.status ||
                      "Not Verified"}

                </span>

              </div>

            </div>

            <div className="p-6">

              {/* Instrument Details */}
              <h3 className="font-semibold mb-5">
                Instrument Details
              </h3>

              <div className="grid sm:grid-cols-2 gap-5">

                <div>
                  <p className="text-xs text-slate-500">
                    Instrument Type
                  </p>

                  <p className="text-sm font-medium mt-1">
                    {instrument.type ||
                      "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Trade Category
                  </p>

                  <p className="text-sm font-medium mt-1">
                    {instrument.tradeCategory ||
                      "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Manufacturer
                  </p>

                  <p className="text-sm font-medium mt-1">
                    {instrument.manufacturer ||
                      "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Model
                  </p>

                  <p className="text-sm font-medium mt-1">
                    {instrument.model ||
                      "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Serial Number
                  </p>

                  <p className="text-sm font-medium mt-1">
                    {instrument.serial ||
                      "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Capacity
                  </p>

                  <p className="text-sm font-medium mt-1">
                    {instrument.capacity ||
                      "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Accuracy Class
                  </p>

                  <p className="text-sm font-medium mt-1">
                    {instrument.accuracyClass ||
                      "Not available"}
                  </p>
                </div>

              </div>

              {/* Current Status */}
              <div className="border-t border-[#D9E0E5] mt-6 pt-6">

                <h3 className="font-semibold mb-5">
                  Current Status
                </h3>

                <div className="space-y-4">

                  <div className="flex gap-3">

                    <User
                      size={18}
                      className="text-[#164A63]"
                    />

                    <div>
                      <p className="text-xs text-slate-500">
                        Current Owner
                      </p>

                      <p className="text-sm font-medium">
                        {instrument.owner ||
                          "Not available"}
                      </p>
                    </div>

                  </div>

                  <div className="flex gap-3">

                    <MapPin
                      size={18}
                      className="text-[#164A63]"
                    />

                    <div>
                      <p className="text-xs text-slate-500">
                        Registered Location
                      </p>

                      <p className="text-sm font-medium">
                        {instrument.location ||
                          "Not available"}
                      </p>
                    </div>

                  </div>

                  <div className="flex gap-3">

                    <CalendarDays
                      size={18}
                      className="text-[#164A63]"
                    />

                    <div>
                      <p className="text-xs text-slate-500">
                        Last Verification
                      </p>

                      <p className="text-sm font-medium">
                        {formatDate(
                          instrument.verifiedOn
                        )}
                      </p>
                    </div>

                  </div>

                </div>

              </div>

              {/* Certificate */}
              <div className="border-t border-[#D9E0E5] mt-6 pt-6">

                <div className="flex gap-3">

                  <FileCheck2
                    size={19}
                    className={
                      isVerified
                        ? "text-green-600"
                        : "text-slate-400"
                    }
                  />

                  <div className="flex-1">

                    <p className="text-xs text-slate-500">
                      Digital Certificate
                    </p>

                    {instrument.certificate ? (
                      <>
                        <p className="text-sm font-semibold">
                          {instrument.certificate}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          Valid until{" "}
                          {formatDate(
                            instrument.validUntil
                          )}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-500 mt-1">
                        No active digital certificate
                        is associated with this
                        instrument.
                      </p>
                    )}

                  </div>

                </div>

              </div>

              {/* Officer */}
              {instrument.officer && (
                <div className="border-t border-[#D9E0E5] mt-6 pt-6">

                  <p className="text-xs text-slate-500">
                    Verification Officer
                  </p>

                  <p className="text-sm font-medium mt-1">
                    {instrument.officer}
                  </p>

                </div>
              )}

              {/* Verification result */}
              {instrument.result && (
                <div className="mt-5">

                  <span
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                      instrument.result === "Passed"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >

                    {instrument.result ===
                    "Passed" ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <XCircle size={14} />
                    )}

                    Verification Result:{" "}
                    {instrument.result}

                  </span>

                </div>
              )}

            </div>

          </div>
        )}

        <p className="text-xs text-slate-400 text-center mt-6">
          WebFlux Digital Instrument Verification
          System
        </p>

      </main>

    </div>
  );
}

export default VerifyInstrument;