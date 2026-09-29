import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Scale,
  CheckCircle2,
  CalendarDays,
  MapPin,
  User,
  FileCheck2,
  ArrowRightLeft,
  History,
  QrCode,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

function InstrumentDetails() {
  const { id } = useParams();

  const [instrument, setInstrument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInstrument = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/instruments/${id}`
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Instrument not found"
          );
        }

        setInstrument(result.data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInstrument();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading instrument passport...
        </p>
      </div>
    );
  }

  if (error || !instrument) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="font-medium text-red-700">
          Unable to load instrument
        </p>

        <p className="mt-1 text-sm text-red-600">
          {error || "Instrument not found"}
        </p>

        <Link
          to="/trader/instruments"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#164a63]"
        >
          <ArrowLeft size={16} />
          Back to instruments
        </Link>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const statusIsVerified = instrument.status === "Verified";

  const statusClasses = statusIsVerified
    ? "bg-green-50 text-green-700"
    : instrument.status === "Expired"
      ? "bg-red-50 text-red-700"
      : "bg-amber-50 text-amber-700";

  return (
    <div>
      {/* Back */}
      <Link
        to="/trader/instruments"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#164a63]"
      >
        <ArrowLeft size={16} />
        Back to instruments
      </Link>

      {/* Header */}
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#e8f0f3] text-[#164a63]">
            <Scale size={24} />
          </div>

          <div>
            <p className="text-sm font-medium text-[#287d4b]">
              Digital Instrument Passport
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              {instrument.instrumentId}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {instrument.instrumentType}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${statusClasses}`}
        >
          {statusIsVerified && <CheckCircle2 size={16} />}
          {instrument.status}
        </span>
      </div>

      {/* Quick information */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard
          icon={<CalendarDays size={18} />}
          label="Last verified"
          value={formatDate(instrument.lastVerifiedAt)}
        />

        <InfoCard
          icon={<CalendarDays size={18} />}
          label="Valid until"
          value={formatDate(instrument.validUntil)}
        />

        <InfoCard
          icon={<MapPin size={18} />}
          label="Current location"
          value={instrument.installationLocation}
        />

        <InfoCard
          icon={<User size={18} />}
          label="Current owner"
          value={instrument.currentOwner}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Identity */}
        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="font-semibold text-slate-900">
              Instrument identity
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Permanent information associated with this instrument.
            </p>
          </div>

          <div className="grid gap-x-8 gap-y-5 p-5 sm:grid-cols-2">
            <Detail
              label="Instrument ID"
              value={instrument.instrumentId}
            />

            <Detail
              label="Trade category"
              value={instrument.tradeCategory}
            />

            <Detail
              label="Instrument type"
              value={instrument.instrumentType}
            />

            <Detail
              label="Manufacturer"
              value={instrument.manufacturer}
            />

            <Detail
              label="Model"
              value={instrument.model}
            />

            <Detail
              label="Serial number"
              value={instrument.serialNumber}
            />

            <Detail
              label="Capacity"
              value={instrument.capacity}
            />

            <Detail
              label="Accuracy class"
              value={
                instrument.accuracyClass || "Not specified"
              }
            />

            <Detail
              label="Current owner"
              value={instrument.currentOwner}
            />

            <Detail
              label="Installation location"
              value={instrument.installationLocation}
            />
          </div>
        </section>

        {/* QR */}
        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="font-semibold text-slate-900">
              Instrument verification
            </h3>
          </div>

          <div className="flex flex-col items-center p-6 text-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-md border-2 border-slate-200 bg-slate-50">
              <QrCode
                size={90}
                strokeWidth={1.4}
                className="text-slate-700"
              />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-800">
              Scan to verify
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              This QR will identify the instrument and display
              its current verification status.
            </p>

            <button className="mt-4 w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Download QR
            </button>
          </div>
        </section>
      </div>

      {/* Ownership */}
      <section className="mt-6 rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-semibold text-slate-900">
              Ownership
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Current ownership and transfer history are preserved.
            </p>
          </div>

          <Link
            to="/trader/transfers"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowRightLeft size={16} />
            Transfer instrument
          </Link>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <User size={19} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                {instrument.currentOwner}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Current owner
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lifecycle */}
      <section className="mt-6 rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <History
              size={18}
              className="text-[#164a63]"
            />

            <h3 className="font-semibold text-slate-900">
              Instrument lifecycle
            </h3>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Complete history of important events associated with
            this instrument.
          </p>
        </div>

        <div className="p-5">
          {instrument.lifecycleHistory &&
          instrument.lifecycleHistory.length > 0 ? (
            <div className="relative ml-2 border-l border-slate-200 pl-7">
              {[...instrument.lifecycleHistory]
                .reverse()
                .map((event, index) => (
                  <div
                    key={`${event.date}-${event.event}-${index}`}
                    className={`relative ${
                      index !==
                      instrument.lifecycleHistory.length - 1
                        ? "pb-8"
                        : ""
                    }`}
                  >
                    <div className="absolute -left-[35px] top-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-[#164a63] ring-1 ring-slate-200" />

                    <p className="text-xs font-medium text-slate-400">
                      {formatDate(event.date)}
                    </p>

                    <h4 className="mt-1 text-sm font-semibold text-slate-900">
                      {event.event}
                    </h4>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      {event.description}
                    </p>

                    {event.performedBy && (
                      <p className="mt-1 text-xs text-slate-400">
                        Performed by: {event.performedBy}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No lifecycle events available.
            </p>
          )}
        </div>
      </section>

      {/* Certificate */}
      <section className="mt-6 rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-[#164a63]">
              <FileCheck2 size={20} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Current verification certificate
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Certificate linked to {instrument.instrumentId}
              </p>
            </div>
          </div>

          <button className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            View certificate
          </button>
        </div>
      </section>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}

        <span className="text-xs font-medium">
          {label}
        </span>
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}

export default InstrumentDetails;