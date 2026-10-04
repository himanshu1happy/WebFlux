import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MapPin,
  Camera,
  QrCode,
  User,
  MapPinned,
  ClipboardCheck,
  AlertCircle,
  FileText,
  Upload,
  ShieldCheck,
  RefreshCw,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";

import { authFetch, formatDate, getUser } from "../../auth";
import API_URL from "../../api";
import { QRCodeCanvas } from "qrcode.react";
function InspectionDetails() {
  const { id: applicationId } = useParams();
  const [searchParams] = useSearchParams();
  const selectedInstrumentId = searchParams.get("instrumentId");
  const user = getUser();

  const [application, setApplication] = useState(null);
  const [instrument, setInstrument] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [invoiceImageUrl, setInvoiceImageUrl] = useState(null);
  // Inspection fields
  const [physicalCondition, setPhysicalCondition] = useState("");
  const [workingCondition, setWorkingCondition] = useState("");
  const [accuracyResult, setAccuracyResult] = useState("");
  const [reading, setReading] = useState("");
  
  // GPS
  const [gpsCaptured, setGpsCaptured] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState(null);

  // Photos
  const [photos, setPhotos] = useState([]);

  // Remarks
  const [remarks, setRemarks] = useState("");

  // Submission
  const [inspectionSubmitting, setInspectionSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [instrumentCompleted, setInstrumentCompleted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState("");

  // Ownership observation
  const [observedOwner, setObservedOwner] = useState("");
  const [observedLocation, setObservedLocation] = useState("");
  const [ownershipRemarks, setOwnershipRemarks] = useState("");
  const [ownershipSubmitting, setOwnershipSubmitting] = useState(false);

  // Scheduling
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);

  const handleSchedule = async () => {
    if (!scheduleDate) {
      alert("Please select a date to schedule the inspection.");
      return;
    }
    try {
      setScheduleSubmitting(true);
      const response = await authFetch(`/api/applications/${applicationId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "Inspection Scheduled",
          scheduledDate: scheduleDate
        }),
      });
      if (!response?.success) throw new Error(response?.message || "Failed to schedule.");
      
      setApplication(response.data);
      alert("Inspection scheduled successfully.");
    } catch (err) {
      alert(`Failed to schedule: ${err.message}`);
    } finally {
      setScheduleSubmitting(false);
    }
  };

  // --------------------------------------------------
  // Load application + instrument
  // --------------------------------------------------
  const loadInspection = useCallback(async () => {
    try {
      if (!applicationId) {
        throw new Error("Application ID is missing.");
      }

      const applicationResponse = await authFetch(`/api/applications/${applicationId}`);
      const applicationData = applicationResponse.data;

      if (!applicationData) {
        throw new Error("Application not found.");
      }

      const selectedInstrument = selectedInstrumentId
        ? applicationData.instruments?.find(
            (item) => item.instrumentId === selectedInstrumentId
          )
        : applicationData.instruments?.length === 1
          ? applicationData.instruments[0]
          : null;

      if (!selectedInstrument?.instrumentId) {
        throw new Error(
          "Select an instrument from the inspection list to continue."
        );
      }

      const instrumentResponse = await authFetch(`/api/instruments/${selectedInstrument.instrumentId}`);
      setApplication(applicationData);
      setInstrumentCompleted(Boolean(selectedInstrument.inspectionCompleted));
      setInstrument(instrumentResponse.data);
      setError("");

      // Now it's safe to fetch the protected invoice image
      if (instrumentResponse.data.invoiceDocument) {
        const token = localStorage.getItem("token");
        fetch(`${API_URL}/api/instruments/files/${instrumentResponse.data.invoiceDocument}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.blob())
        .then(blob => setInvoiceImageUrl(URL.createObjectURL(blob)))
        .catch(err => console.error("Failed to load invoice image:", err));
      }
      
    } catch (err) {
      console.error("Failed to load inspection:", err);
      setError(err.message || "Failed to load inspection.");
    } finally {
      setLoading(false);
    }
  }, [applicationId, selectedInstrumentId]);

  useEffect(() => {
    // This helper updates state only after asynchronous API responses.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadInspection();
  }, [loadInspection]);

  const retryLoadInspection = () => {
    setLoading(true);
    setError("");
    void loadInspection();
  };

  // --------------------------------------------------
  // Application instrument IDs
  // --------------------------------------------------
  const applicationInstrumentIds = useMemo(() => {
    return application?.instruments?.map((item) => item.instrumentId) || [];
  }, [application]);

  // --------------------------------------------------
  // GPS
  // --------------------------------------------------
  const captureGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGpsCaptured(true);
      },
      (error) => {
        console.error("GPS error:", error);
        alert("Unable to capture GPS location. Please allow location permission.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // --------------------------------------------------
  // Photo selection
  // --------------------------------------------------
  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files || []);
    setPhotos(files);
  };

  // --------------------------------------------------
  // Submit inspection
  // --------------------------------------------------
  const submitInspection = async (result) => {
    if (inspectionSubmitting) return;

    if (!physicalCondition || !workingCondition || !accuracyResult) {
      alert("Please complete all inspection checks before submitting.");
      return;
    }

    if (!applicationId || !instrument?.instrumentId) {
      alert("Application ID or Instrument information is missing.");
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to mark this verification as ${result}?`);
    if (!confirmed) return;

    try {
      setInspectionSubmitting(true);

      const formData = new FormData();
      formData.append("officerName", user?.name || "LMO Officer");
      formData.append("physicalCondition", physicalCondition);
      formData.append("workingCondition", workingCondition);
      formData.append("accuracyResult", accuracyResult);
      formData.append("reading", reading);
      formData.append("remarks", remarks);
      formData.append("result", result);
      
      if (gpsCaptured && gpsCoordinates) {
        formData.append("gps", JSON.stringify(gpsCoordinates));
      }

      photos.forEach((photo) => {
        formData.append("photos", photo);
      });

      const token = localStorage.getItem("token");
      const inspectionResponse = await fetch(`${API_URL}/api/instruments/${instrument.instrumentId}/inspection`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      const inspectionData = await inspectionResponse.json().catch(() => ({}));

      if (!inspectionResponse.ok || !inspectionData?.success) {
        throw new Error(inspectionData?.message || "Failed to submit inspection.");
      }

      const applicationResponse = await authFetch(`/api/applications/${applicationId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "Inspection Completed",
          instrumentId: instrument.instrumentId,
        }),
      });

      if (!applicationResponse?.success) {
        throw new Error(applicationResponse?.message || "Inspection was saved, but application status could not be updated.");
      }

      setSubmissionResult(result);
      setSubmitted(true);
    } catch (err) {
      console.error("Inspection submission error:", err);
      alert(`Failed to submit inspection: ${err.message || "Unknown error"}`);
    } finally {
      setInspectionSubmitting(false);
    }
  };

  // --------------------------------------------------
  // Ownership observation
  // --------------------------------------------------
  const submitOwnershipObservation = async () => {
    if (ownershipSubmitting) return;

    if (!observedOwner.trim() || !observedLocation.trim()) {
      alert("Please enter the observed owner and current location.");
      return;
    }

    if (!instrument?.instrumentId) {
      alert("Instrument information is missing.");
      return;
    }

    try {
      setOwnershipSubmitting(true);

      const response = await authFetch(`/api/instruments/${instrument.instrumentId}/ownership-observation`, {
        method: "POST",
        body: JSON.stringify({
          observedOwner: observedOwner.trim(),
          location: observedLocation.trim(),
          officerName: user?.name || "LMO Officer",
          remarks: ownershipRemarks.trim(),
        }),
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to record ownership observation.");
      }

      setInstrument(response.data);
      setObservedOwner("");
      setObservedLocation("");
      setOwnershipRemarks("");

      alert("Ownership/possession observation recorded successfully.");
    } catch (err) {
      console.error("Ownership observation error:", err);
      alert(`Failed to record observation: ${err.message || "Unknown error"}`);
    } finally {
      setOwnershipSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7F8] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={28} className="animate-spin mx-auto text-[#164A63]" />
          <p className="text-sm text-slate-500 mt-3">Loading inspection...</p>
        </div>
      </div>
    );
  }

  if (error || !application || !instrument) {
    return (
      <div className="min-h-screen bg-[#F5F7F8] flex items-center justify-center px-6">
        <div className="bg-white border border-[#D9E0E5] rounded-xl p-8 text-center max-w-lg w-full">
          <AlertCircle size={42} className="text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#1F2933] mb-2">Unable to Load Inspection</h2>
          <p className="text-sm text-slate-500 mb-6">{error || "The requested inspection could not be found."}</p>
          <div className="flex justify-center gap-3">
            <button onClick={retryLoadInspection} className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#CBD5DB] rounded-lg text-sm font-medium text-[#164A63] hover:bg-slate-50">
              <RefreshCw size={16} /> Retry
            </button>
            <Link to="/officer/inspections" className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#164A63] text-white rounded-lg text-sm font-medium hover:bg-[#123D52]">
              <ArrowLeft size={16} /> Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F7F8]">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="bg-white border border-[#D9E0E5] rounded-xl p-10 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${submissionResult === "PASS" ? "bg-green-100" : "bg-red-100"}`}>
              {submissionResult === "PASS" ? <CheckCircle2 size={36} className="text-green-700" /> : <XCircle size={36} className="text-red-700" />}
            </div>
            <h1 className="text-2xl font-semibold text-[#1F2933] mb-2">Inspection Submitted</h1>
            <p className="text-slate-500 mb-2">The field inspection has been recorded successfully.</p>
            <p className="text-sm text-slate-500 mb-8">
              Result: <span className={`font-semibold ${submissionResult === "PASS" ? "text-green-700" : "text-red-700"}`}>{submissionResult}</span>
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link to="/officer/inspections" className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#164A63] text-white rounded-lg text-sm font-medium hover:bg-[#123D52]">
                <ArrowLeft size={17} /> Back to Inspections
              </Link>
              <Link to={`/officer/inspections/${applicationId}?instrumentId=${encodeURIComponent(instrument.instrumentId)}`} className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-[#CBD5DB] text-[#164A63] rounded-lg text-sm font-medium hover:bg-[#F5F7F8]">
                View Inspection
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7F8]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <Link to="/officer/inspections" className="inline-flex items-center gap-2 text-sm text-[#164A63] mb-4 hover:underline">
              <ArrowLeft size={16} /> Back to Inspections
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-[#164A63] flex items-center justify-center">
                <ClipboardCheck size={23} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-[#1F2933]">Instrument Inspection</h1>
                <p className="text-sm text-slate-500">
                  Application: <span className="font-medium text-[#164A63]">{application.applicationId}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 bg-white border border-[#D9E0E5] rounded-lg">
            <p className="text-xs text-slate-500">Instrument ID</p>
            <p className="font-semibold text-[#164A63] mt-1">{instrument.instrumentId}</p>
          </div>
        </div>

        {/* Application Information */}
        <div className="bg-white border border-[#D9E0E5] rounded-xl mb-6">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <FileText size={19} className="text-[#164A63]" />
              <h2 className="font-semibold text-[#1F2933]">Application Information</h2>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <InfoItem label="Application ID" value={application.applicationId} />
            <InfoItem label="Applicant / Trader" value={application.applicant} />
            <InfoItem label="Application Type" value={application.applicationType} />
            <InfoItem label="Submitted" value={formatDate(application.submittedAt || application.createdAt)} />
            {application.scheduledDate && (
              <InfoItem label="Scheduled inspection" value={formatDate(application.scheduledDate)} />
            )}
          </div>
        </div>

        {/* Application Instruments */}
        {applicationInstrumentIds.length > 1 && (
          <div className="bg-white border border-[#D9E0E5] rounded-xl mb-6">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h2 className="font-semibold text-[#1F2933]">Instruments in Application</h2>
              <p className="text-xs text-slate-500 mt-1">Select an instrument to inspect it individually.</p>
            </div>
            <div className="p-6 flex flex-wrap gap-2">
              {application.instruments.map((applicationInstrument) => (
                <Link
                  key={applicationInstrument.instrumentId}
                  to={`/officer/inspections/${applicationId}?instrumentId=${encodeURIComponent(applicationInstrument.instrumentId)}`}
                  onClick={() => {
                    setLoading(true);
                    setInvoiceImageUrl(null);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm ${applicationInstrument.instrumentId === instrument.instrumentId ? "bg-[#EEF4F7] text-[#164A63] font-medium" : "bg-slate-100 text-slate-600"}`}
                >
                  {applicationInstrument.instrumentId}
                  {applicationInstrument.inspectionCompleted ? " (Completed)" : ""}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Instrument Information */}
        <div className="bg-white border border-[#D9E0E5] rounded-xl mb-6">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <ShieldCheck size={19} className="text-[#164A63]" />
              <h2 className="font-semibold text-[#1F2933]">Instrument Information</h2>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <InfoItem label="Instrument ID" value={instrument.instrumentId} />
            <InfoItem label="Instrument Type" value={instrument.instrumentType} />
            <InfoItem label="Trade Category" value={instrument.tradeCategory} />
            <InfoItem label="Manufacturer" value={instrument.manufacturer} />
            <InfoItem label="Model" value={instrument.model} />
            <InfoItem label="Serial Number" value={instrument.serialNumber} />
            <InfoItem label="Capacity" value={instrument.capacity} />
            <InfoItem label="Accuracy Class" value={instrument.accuracyClass} />
            <InfoItem label="Status" value={instrument.status} status />
            <InfoItem label="Registered Owner" value={instrument.currentOwner} />
            <InfoItem label="Registered Location" value={instrument.installationLocation} />
            <InfoItem label="Last Verified" value={instrument.lastVerifiedAt ? formatDate(instrument.lastVerifiedAt) : "Not verified"} />
          </div>
        </div>

        {/* Scheduling & Allocation */}
        {application.status === "Submitted" || application.status === "Assigned" ? (
          <div className="bg-white border border-[#D9E0E5] rounded-xl mb-6 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays size={19} className="text-[#164A63]" />
              <h2 className="font-semibold text-[#1F2933]">Schedule Inspection</h2>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5">
              <p className="text-sm text-amber-800">This application requires an inspection date before field verification can begin.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-[#1F2933] mb-2">Select Date</label>
                <input type="date" min={new Date().toISOString().split("T")[0]} value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="w-full border border-[#CBD5DB] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#164A63]" />
              </div>
              <button type="button" onClick={handleSchedule} disabled={scheduleSubmitting} className="px-5 py-2.5 bg-[#164A63] text-white rounded-lg text-sm font-medium hover:bg-[#123D52] disabled:opacity-60">
                {scheduleSubmitting ? "Scheduling..." : "Schedule Field Visit"}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl mb-6 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-green-700" />
              <p className="font-medium text-green-800">Inspection Scheduled / Active</p>
            </div>
          </div>
        )}

        {/* QR + GPS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white border border-[#D9E0E5] rounded-xl">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <QrCode size={19} className="text-[#164A63]" />
                <h2 className="font-semibold text-[#1F2933]">Instrument QR</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-[#CBD5DB] rounded-xl p-8 text-center bg-white">
                <div className="flex justify-center mb-4">
                  <QRCodeCanvas
                    value={`${window.location.origin}/verify-instrument?instrumentId=${encodeURIComponent(instrument.instrumentId)}`}
                    size={130}
                    level="H"
                    includeMargin
                  />
                </div>
                <p className="font-medium text-[#1F2933]">Instrument Digital Identity</p>
                <p className="text-sm text-slate-500 mt-1">Scan to view immutable history.</p>
                <Link to={`/verify-instrument?instrumentId=${encodeURIComponent(instrument.instrumentId)}`} className="inline-block mt-5 px-4 py-2.5 bg-[#164A63] text-white rounded-lg text-sm font-medium hover:bg-[#123D52]">
                  Open Verification
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#D9E0E5] rounded-xl">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <MapPinned size={19} className="text-[#164A63]" />
                <h2 className="font-semibold text-[#1F2933]">Inspection Location</h2>
              </div>
            </div>
            <div className="p-6">
              {!gpsCaptured ? (
                <div className="text-center py-6">
                  <MapPin size={42} className="mx-auto text-[#164A63] mb-4" />
                  <p className="font-medium text-[#1F2933]">Capture GPS Location</p>
                  <p className="text-sm text-slate-500 mt-1 mb-5">Capture the current inspection location using device GPS.</p>
                  <button type="button" onClick={captureGPS} className="px-5 py-2.5 bg-[#164A63] text-white rounded-lg text-sm font-medium hover:bg-[#123D52]">
                    Capture GPS
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle2 size={22} className="text-green-700" />
                    <p className="font-semibold text-green-800">GPS Captured</p>
                  </div>
                  <div className="text-sm text-green-800 space-y-1">
                    <p>Latitude: {gpsCoordinates?.latitude}</p>
                    <p>Longitude: {gpsCoordinates?.longitude}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ownership History */}
        <div className="bg-white border border-[#D9E0E5] rounded-xl mb-6">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <User size={19} className="text-[#164A63]" />
              <h2 className="font-semibold text-[#1F2933]">Ownership History</h2>
            </div>
          </div>
          <div className="p-6">
            {instrument.ownershipHistory?.length ? (
              <div className="space-y-4">
                {instrument.ownershipHistory.map((item, index) => (
                  <div key={index} className="border border-[#E1E7EB] rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#1F2933]">{item.ownerName}</p>
                        <p className="text-sm text-slate-500 mt-1">{item.location}</p>
                      </div>
                      <span className="inline-flex w-fit px-2.5 py-1 rounded-full bg-[#EEF4F7] text-[#164A63] text-xs font-medium">{item.source}</span>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500">From</p>
                        <p className="font-medium text-[#1F2933]">{item.fromDate ? new Date(item.fromDate).toLocaleString("en-IN") : "-"}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">To</p>
                        <p className="font-medium text-[#1F2933]">{item.toDate ? new Date(item.toDate).toLocaleString("en-IN") : "Current"}</p>
                      </div>
                    </div>
                    {item.remarks && (
                      <p className="mt-3 text-sm text-slate-600"><span className="font-medium">Remarks:</span> {item.remarks}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No ownership history available.</p>
            )}
          </div>
        </div>

        {/* Verification History & Readings */}
        <div className="bg-white border border-[#D9E0E5] rounded-xl mb-6">
          <div className="px-6 py-4 border-b border-[#E5E7EB] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FileText size={19} className="text-[#164A63]" />
              <h2 className="font-semibold text-[#1F2933]">Verification History & Readings</h2>
            </div>
            <span className="text-xs font-medium bg-[#EEF4F7] text-[#164A63] px-3 py-1 rounded-full">
              Total Verifications: {instrument.verificationHistory?.length || 0}
            </span>
          </div>
          <div className="p-6">
            {instrument.verificationHistory?.length ? (
              <div className="space-y-4">
                {[...instrument.verificationHistory].sort((a,b) => new Date(b.verificationDate) - new Date(a.verificationDate)).map((history, idx) => (
                  <div key={idx} className="border border-[#E1E7EB] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[#1F2933]">
                        {new Date(history.verificationDate).getFullYear()} Verification
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        Officer: {history.officerName} | Date: {formatDate(history.verificationDate)}
                      </p>
                    </div>
                    <div className="flex gap-4 items-center">
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Reading Recorded</p>
                        <p className="font-medium text-[#1F2933]">{history.readings || "N/A"}</p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${history.result === 'Passed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {history.result === 'Passed' ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No previous verification history exists for this instrument.</p>
            )}
          </div>
        </div>

        {/* Ownership Observation */}
        <div className="bg-white border border-[#D9E0E5] rounded-xl mb-6">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <User size={19} className="text-[#164A63]" />
              <div>
                <h2 className="font-semibold text-[#1F2933]">Ownership / Possession Observation</h2>
                <p className="text-xs text-slate-500 mt-1">Record what the officer observes in the field.</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="bg-[#F5F7F8] border border-[#E1E7EB] rounded-lg p-4 mb-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Registered Owner</p>
                  <p className="font-semibold text-[#1F2933] mt-1">{instrument.currentOwner || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Registered Location</p>
                  <p className="font-semibold text-[#1F2933] mt-1">{instrument.installationLocation || "-"}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#1F2933] mb-2">Observed Owner / Possessor</label>
                <input type="text" value={observedOwner} onChange={(e) => setObservedOwner(e.target.value)} placeholder="Enter observed owner / possessor" className="w-full border border-[#CBD5DB] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#164A63]/20 focus:border-[#164A63]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2933] mb-2">Observed Current Location</label>
                <input type="text" value={observedLocation} onChange={(e) => setObservedLocation(e.target.value)} placeholder="Enter current location" className="w-full border border-[#CBD5DB] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#164A63]/20 focus:border-[#164A63]" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#1F2933] mb-2">Observation Remarks</label>
                <textarea value={ownershipRemarks} onChange={(e) => setOwnershipRemarks(e.target.value)} rows={3} placeholder="Add any relevant observation..." className="w-full border border-[#CBD5DB] rounded-lg px-3 py-2.5 text-sm outline-none resize-none focus:ring-2 focus:ring-[#164A63]/20 focus:border-[#164A63]" />
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <button type="button" onClick={submitOwnershipObservation} disabled={ownershipSubmitting} className="px-5 py-2.5 bg-[#164A63] text-white rounded-lg text-sm font-medium hover:bg-[#123D52] disabled:opacity-60 disabled:cursor-not-allowed">
                {ownershipSubmitting ? "Recording..." : "Record Observation"}
              </button>
            </div>
          </div>
        </div>
         {/* Invoice & System OCR Report */}
          {/* Invoice & System OCR Report */}
        <div className="bg-white border border-[#D9E0E5] rounded-xl mb-6">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <FileText size={19} className="text-[#164A63]" />
              <h2 className="font-semibold text-[#1F2933]">Trader Invoice & Validation Report</h2>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-medium text-[#1F2933] mb-3">Uploaded Invoice Document</p>
              {invoiceImageUrl ? (
                instrument?.invoiceDocument?.toLowerCase().endsWith(".pdf") ? (
                  <div className="w-full h-48 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center justify-center text-sm text-slate-500">
                    <FileText size={36} className="text-[#164A63] mb-3" />
                    <p className="font-medium text-[#1F2933]">PDF Document Attached</p>
                    <a href={invoiceImageUrl} target="_blank" rel="noreferrer" className="mt-2 text-[#164A63] hover:underline font-medium">
                      Open PDF in new tab
                    </a>
                  </div>
                ) : (
                  <a href={invoiceImageUrl} target="_blank" rel="noreferrer">
                    <img src={invoiceImageUrl} alt="Invoice" className="max-w-full rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:opacity-90 transition" />
                  </a>
                )
              ) : (
                <div className="w-full h-48 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-sm text-slate-500">
                  No invoice document available
                </div>
              )}
            </div>
            
            <div>
              <p className="text-sm font-medium text-[#1F2933] mb-3">System OCR Match Report</p>
              {instrument.ocrValidationData && instrument.ocrValidationData.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {instrument.ocrValidationData.map((res, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border text-sm flex justify-between items-center ${
                      res.status === "MATCH" ? "bg-green-50 border-green-200" :
                      res.status === "FLAGGED" ? "bg-amber-50 border-amber-200" :
                      res.status === "NOT PROVIDED" ? "bg-slate-50 border-slate-200" :
                      "bg-red-50 border-red-200"
                    }`}>
                      <span className="font-medium text-slate-800">{res.label}: <span className="font-normal">{res.value}</span></span>
                      <span className={`font-bold flex items-center gap-1 ${
                        res.status === "MATCH" ? "text-green-700" :
                        res.status === "FLAGGED" ? "text-amber-700" : 
                        res.status === "NOT PROVIDED" ? "text-slate-500" :
                        "text-red-700"
                      }`}>
                        {res.status === "MATCH" && <CheckCircle2 size={15} />}
                        {res.status === "FLAGGED" && <AlertTriangle size={15} />}
                        {res.status === "MISMATCH" && <XCircle size={15} />}
                        {res.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500">
                  The trader bypassed or failed to run the automated OCR check prior to submission. Please review the invoice manually.
                </div>
              )}
            </div>
          </div>
        </div>

          {/* Inspection Checks */}
        <div className="bg-white border border-[#D9E0E5] rounded-xl mb-6">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <ClipboardCheck size={19} className="text-[#164A63]" />
              <h2 className="font-semibold text-[#1F2933]">Inspection Checks</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <InspectionCheck title="Physical Condition" value={physicalCondition} onChange={setPhysicalCondition} options={["Satisfactory", "Minor Issues", "Damaged"]} />
            <InspectionCheck title="Working Condition" value={workingCondition} onChange={setWorkingCondition} options={["Working Properly", "Partially Working", "Not Working"]} />
            <InspectionCheck title="Accuracy / Measurement Test" value={accuracyResult} onChange={setAccuracyResult} options={["Within Permissible Limit", "Borderline", "Outside Permissible Limit"]} />
            
            {/* Embedded Reading Input */}
            <div className="pt-2 border-t border-[#E5E7EB]">
              <label className="block text-sm font-semibold text-[#1F2933] mb-3 mt-4">Test Reading Output</label>
              <input type="text" value={reading} onChange={(e) => setReading(e.target.value)} placeholder="e.g. 50.02 kg" className="w-full border border-[#CBD5DB] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#164A63]" />
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white border border-[#D9E0E5] rounded-xl mb-6">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <Camera size={19} className="text-[#164A63]" />
              <h2 className="font-semibold text-[#1F2933]">Inspection Evidence</h2>
            </div>
          </div>
          <div className="p-6">
            <label className="block">
              <div className="border-2 border-dashed border-[#CBD5DB] rounded-xl p-7 text-center cursor-pointer hover:bg-[#F8FAFB]">
                <Upload size={30} className="mx-auto text-[#164A63] mb-3" />
                <p className="font-medium text-[#1F2933]">Upload Inspection Photos</p>
                <p className="text-sm text-slate-500 mt-1">Select photos captured during inspection.</p>
                <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
              </div>
            </label>
            {photos.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-[#1F2933] mb-2">Selected Photos: {photos.length}</p>
                <div className="space-y-2">
                  {photos.map((photo, index) => (
                    <div key={`${photo.name}-${index}`} className="text-sm text-slate-600 bg-[#F5F7F8] rounded-lg px-3 py-2">
                      {photo.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Remarks */}
        <div className="bg-white border border-[#D9E0E5] rounded-xl mb-6">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <FileText size={19} className="text-[#164A63]" />
              <h2 className="font-semibold text-[#1F2933]">Officer Remarks</h2>
            </div>
          </div>
          <div className="p-6">
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={5} placeholder="Enter inspection remarks..." className="w-full border border-[#CBD5DB] rounded-lg px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-[#164A63]/20 focus:border-[#164A63]" />
          </div>
        </div>

        {instrumentCompleted && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            This instrument has already been inspected. Select another instrument in this application to continue.
          </div>
        )}

        {/* Submit */}
        <div className="bg-white border border-[#D9E0E5] rounded-xl p-6">
          <div className="flex items-start gap-3 mb-6">
            <AlertCircle size={20} className="text-[#B7791F] mt-0.5" />
            <div>
              <p className="font-medium text-[#1F2933]">Complete the inspection before submitting</p>
              <p className="text-sm text-slate-500 mt-1">Ensure physical condition, working condition and accuracy checks are recorded.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={() => submitInspection("PASS")} disabled={inspectionSubmitting || instrumentCompleted} className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed">
              <CheckCircle2 size={18} /> {inspectionSubmitting ? "Submitting..." : "Pass Verification"}
            </button>
            <button type="button" onClick={() => submitInspection("FAIL")} disabled={inspectionSubmitting || instrumentCompleted} className="flex-1 flex items-center justify-center gap-2 px-5 py-3 border border-red-300 text-red-700 bg-white rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed">
              <XCircle size={18} /> {inspectionSubmitting ? "Submitting..." : "Fail Verification"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function InfoItem({ label, value, status = false }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      {status ? (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
            value === "Verified" ? "bg-green-100 text-green-700" : value === "Suspended" ? "bg-red-100 text-red-700" : value === "Expired" ? "bg-red-100 text-red-700" : value === "Due Soon" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"
        }`}>
          {value || "-"}
        </span>
      ) : (
        <p className="font-medium text-[#1F2933]">{value || "-"}</p>
      )}
    </div>
  );
}

function InspectionCheck({ title, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#1F2933] mb-3">{title}</label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {options.map((option) => {
          const selected = value === option;
          return (
            <button key={option} type="button" onClick={() => onChange(option)} className={`text-left px-4 py-3 rounded-lg border text-sm transition ${selected ? "border-[#164A63] bg-[#EEF4F7] text-[#164A63] font-medium" : "border-[#D9E0E5] bg-white text-[#4B5563] hover:bg-[#F5F7F8]"}`}>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selected ? "border-[#164A63]" : "border-[#AAB5BC]"}`}>
                  {selected && <div className="w-2 h-2 rounded-full bg-[#164A63]" />}
                </div>
                {option}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default InspectionDetails;