import React, { useEffect, useState } from "react";
import {
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";

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
  Clock,
  FileText,
  Upload,
  ShieldCheck,
} from "lucide-react";

const InspectionDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const applicationId = searchParams.get("applicationId");

  const [instrument, setInstrument] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inspection states
  const [physicalCondition, setPhysicalCondition] = useState("");
  const [workingCondition, setWorkingCondition] = useState("");
  const [accuracyResult, setAccuracyResult] = useState("");

  const [gpsCaptured, setGpsCaptured] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState(null);

  const [photos, setPhotos] = useState([]);
  const [remarks, setRemarks] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState("");

  // Prevent duplicate inspection submissions
  const [inspectionSubmitting, setInspectionSubmitting] = useState(false);

  // Ownership observation
  const [observedOwner, setObservedOwner] = useState("");
  const [observedLocation, setObservedLocation] = useState("");
  const [ownershipRemarks, setOwnershipRemarks] = useState("");
  const [ownershipSubmitting, setOwnershipSubmitting] = useState(false);

  // --------------------------------------------------
  // Fetch instrument
  // --------------------------------------------------

  useEffect(() => {
    const fetchInstrument = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `http://localhost:5000/api/instruments/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch instrument"
          );
        }

        setInstrument(data.data);
      } catch (error) {
        console.error("Failed to fetch instrument:", error);
        alert(`Failed to load instrument: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchInstrument();
  }, [id]);

  // --------------------------------------------------
  // GPS capture
  // --------------------------------------------------

  const captureGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setGpsCoordinates(coordinates);
        setGpsCaptured(true);

        alert("GPS location captured successfully.");
      },
      (error) => {
        console.error("GPS error:", error);

        alert(
          "Unable to capture GPS location. Please allow location permission."
        );
      }
    );
  };

  // --------------------------------------------------
  // Photo upload
  // --------------------------------------------------

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files || []);

    setPhotos(files);
  };

  // --------------------------------------------------
  // Submit inspection
  // --------------------------------------------------

  const submitInspection = async (result) => {
    // Prevent duplicate clicks
    if (inspectionSubmitting) {
      return;
    }

    if (
      !physicalCondition ||
      !workingCondition ||
      !accuracyResult
    ) {
      alert(
        "Please complete all inspection checks before submitting."
      );
      return;
    }

    if (!applicationId) {
      alert(
        "Application ID is missing. Please open the inspection from the inspections list."
      );
      return;
    }

    try {
      setInspectionSubmitting(true);

      // -----------------------------------------------
      // Submit inspection
      // -----------------------------------------------

      const inspectionResponse = await fetch(
        `http://localhost:5000/api/instruments/${instrument.instrumentId}/inspection`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            officerName: "LMO Officer Demo",
            physicalCondition,
            workingCondition,
            accuracyResult,
            gps: gpsCaptured ? gpsCoordinates : null,

            // For now the backend receives an empty array
            // because File objects cannot be directly stored
            // through JSON.
            photos: [],

            remarks,
            result,
          }),
        }
      );

      const inspectionData = await inspectionResponse.json();

      if (!inspectionResponse.ok) {
        throw new Error(
          inspectionData.message ||
            "Failed to submit inspection"
        );
      }

      console.log(
        "Inspection submitted successfully:",
        inspectionData
      );

      // -----------------------------------------------
      // Update application status
      // -----------------------------------------------

      const applicationResponse = await fetch(
        `http://localhost:5000/api/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "Inspection Completed",
          }),
        }
      );

      const applicationData =
        await applicationResponse.json();

      if (!applicationResponse.ok) {
        throw new Error(
          applicationData.message ||
            "Inspection saved, but application status could not be updated."
        );
      }

      console.log(
        "Application status updated:",
        applicationData
      );

      // -----------------------------------------------
      // Success
      // -----------------------------------------------

      setSubmissionResult(result);
      setSubmitted(true);

      alert(
        `Inspection submitted successfully: ${result}`
      );
    } catch (error) {
      console.error(
        "Inspection submission error:",
        error
      );

      alert(
        `Failed to submit inspection: ${error.message}`
      );
    } finally {
      // Re-enable only if submission failed.
      // If successful, submitted screen is shown anyway.
      setInspectionSubmitting(false);
    }
  };

  // --------------------------------------------------
  // Ownership observation
  // --------------------------------------------------

  const submitOwnershipObservation = async () => {
    if (ownershipSubmitting) {
      return;
    }

    if (!observedOwner || !observedLocation) {
      alert(
        "Please enter the observed owner and current location."
      );
      return;
    }

    if (!instrument?.instrumentId) {
      alert("Instrument information is missing.");
      return;
    }

    try {
      setOwnershipSubmitting(true);

      const response = await fetch(
        `http://localhost:5000/api/instruments/${instrument.instrumentId}/ownership-observation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            observedOwner,
            location: observedLocation,
            officerName: "LMO Officer Demo",
            remarks: ownershipRemarks,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to record ownership observation"
        );
      }

      setInstrument(data.data);

      setObservedOwner("");
      setObservedLocation("");
      setOwnershipRemarks("");

      alert(
        "Ownership/possession observation recorded successfully."
      );
    } catch (error) {
      console.error(
        "Ownership observation error:",
        error
      );

      alert(
        `Failed to record observation: ${error.message}`
      );
    } finally {
      setOwnershipSubmitting(false);
    }
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7F8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#164A63] border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <p className="text-[#4B5563]">
            Loading inspection...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Instrument not found
  // --------------------------------------------------

  if (!instrument) {
    return (
      <div className="min-h-screen bg-[#F5F7F8] flex items-center justify-center px-6">
        <div className="bg-white border border-[#D9E0E5] rounded-xl p-8 text-center max-w-md">
          <AlertCircle
            size={42}
            className="text-red-600 mx-auto mb-4"
          />

          <h2 className="text-xl font-semibold text-[#1F2933] mb-2">
            Instrument Not Found
          </h2>

          <p className="text-[#6B7280] mb-6">
            The requested instrument could not be found.
          </p>

          <Link
            to="/officer/inspections"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#164A63] text-white rounded-lg text-sm font-medium"
          >
            <ArrowLeft size={17} />
            Back to Inspections
          </Link>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Submitted screen
  // --------------------------------------------------

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F7F8]">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="bg-white border border-[#D9E0E5] rounded-xl p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2
                size={36}
                className="text-green-700"
              />
            </div>

            <h1 className="text-2xl font-semibold text-[#1F2933] mb-2">
              Inspection Submitted
            </h1>

            <p className="text-[#6B7280] mb-2">
              The inspection has been recorded successfully.
            </p>

            <p className="text-sm text-[#6B7280] mb-8">
              Result:{" "}
              <span
                className={`font-semibold ${
                  submissionResult === "PASS"
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {submissionResult}
              </span>
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/officer/inspections"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#164A63] text-white rounded-lg text-sm font-medium hover:bg-[#123D52]"
              >
                <ArrowLeft size={17} />
                Back to Inspections
              </Link>

              <Link
                to={`/officer/inspections/${instrument.instrumentId}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-[#CBD5DB] text-[#164A63] rounded-lg text-sm font-medium hover:bg-[#F5F7F8]"
              >
                View Instrument
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Main page
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#F5F7F8]">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <Link
              to="/officer/inspections"
              className="inline-flex items-center gap-2 text-sm text-[#164A63] mb-4 hover:underline"
            >
              <ArrowLeft size={16} />
              Back to Inspections
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-[#164A63] flex items-center justify-center">
                <ClipboardCheck
                  size={23}
                  className="text-white"
                />
              </div>

              <div>
                <h1 className="text-2xl font-semibold text-[#1F2933]">
                  Instrument Inspection
                </h1>

                <p className="text-sm text-[#6B7280]">
                  Application:{" "}
                  <span className="font-medium text-[#164A63]">
                    {applicationId || "Not available"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 py-2 bg-white border border-[#D9E0E5] rounded-lg">
            <p className="text-xs text-[#6B7280]">
              Instrument ID
            </p>

            <p className="font-semibold text-[#164A63]">
              {instrument.instrumentId}
            </p>
          </div>
        </div>

        {/* Instrument information */}
        <div className="bg-white border border-[#D9E0E5] rounded-xl mb-6">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={19}
                className="text-[#164A63]"
              />

              <h2 className="font-semibold text-[#1F2933]">
                Instrument Information
              </h2>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <InfoItem
              label="Instrument ID"
              value={instrument.instrumentId}
            />

            <InfoItem
              label="Instrument Type"
              value={instrument.instrumentType}
            />

            <InfoItem
              label="Trade Category"
              value={instrument.tradeCategory}
            />

            <InfoItem
              label="Manufacturer"
              value={instrument.manufacturer}
            />

            <InfoItem
              label="Model"
              value={instrument.model}
            />

            <InfoItem
              label="Serial Number"
              value={instrument.serialNumber}
            />

            <InfoItem
              label="Capacity"
              value={instrument.capacity}
            />

            <InfoItem
              label="Accuracy Class"
              value={instrument.accuracyClass}
            />

            <InfoItem
              label="Status"
              value={instrument.status}
              status
            />

            <InfoItem
              label="Registered Owner"
              value={instrument.currentOwner}
            />

            <InfoItem
              label="Registered Location"
              value={instrument.installationLocation}
            />

            <InfoItem
              label="Last Verified"
              value={
                instrument.lastVerifiedAt
                  ? new Date(
                      instrument.lastVerifiedAt
                    ).toLocaleDateString()
                  : "Not verified"
              }
            />
          </div>
        </div>

        {/* QR and GPS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* QR */}
          <div className="bg-white border border-[#D9E0E5] rounded-xl">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <QrCode
                  size={19}
                  className="text-[#164A63]"
                />

                <h2 className="font-semibold text-[#1F2933]">
                  Instrument QR
                </h2>
              </div>
            </div>

            <div className="p-6">
              <div className="border-2 border-dashed border-[#CBD5DB] rounded-xl p-8 text-center">
                <QrCode
                  size={65}
                  className="mx-auto text-[#164A63] mb-4"
                />

                <p className="font-medium text-[#1F2933]">
                  QR Scanner
                </p>

                <p className="text-sm text-[#6B7280] mt-1">
                  Scan the instrument QR code to verify
                  its digital identity.
                </p>

                <button
                  type="button"
                  className="mt-5 px-4 py-2.5 bg-[#164A63] text-white rounded-lg text-sm font-medium hover:bg-[#123D52]"
                >
                  Start QR Scan
                </button>
              </div>
            </div>
          </div>

          {/* GPS */}
          <div className="bg-white border border-[#D9E0E5] rounded-xl">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <MapPinned
                  size={19}
                  className="text-[#164A63]"
                />

                <h2 className="font-semibold text-[#1F2933]">
                  Inspection Location
                </h2>
              </div>
            </div>

            <div className="p-6">
              {!gpsCaptured ? (
                <div className="text-center py-6">
                  <MapPin
                    size={42}
                    className="mx-auto text-[#164A63] mb-4"
                  />

                  <p className="font-medium text-[#1F2933]">
                    Capture GPS Location
                  </p>

                  <p className="text-sm text-[#6B7280] mt-1 mb-5">
                    Capture the current inspection location
                    using device GPS.
                  </p>

                  <button
                    type="button"
                    onClick={captureGPS}
                    className="px-5 py-2.5 bg-[#164A63] text-white rounded-lg text-sm font-medium hover:bg-[#123D52]"
                  >
                    Capture GPS
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle2
                      size={22}
                      className="text-green-700"
                    />

                    <p className="font-semibold text-green-800">
                      GPS Captured
                    </p>
                  </div>

                  <div className="text-sm text-green-800 space-y-1">
                    <p>
                      Latitude:{" "}
                      {gpsCoordinates?.latitude}
                    </p>

                    <p>
                      Longitude:{" "}
                      {gpsCoordinates?.longitude}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ownership history */}
        <div className="bg-white border border-[#D9E0E5] rounded-xl mb-6">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <User
                size={19}
                className="text-[#164A63]"
              />

              <h2 className="font-semibold text-[#1F2933]">
                Ownership History
              </h2>
            </div>
          </div>

          <div className="p-6">
            {instrument.ownershipHistory?.length ? (
              <div className="space-y-4">
                {instrument.ownershipHistory.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="border border-[#E1E7EB] rounded-lg p-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[#1F2933]">
                            {item.ownerName}
                          </p>

                          <p className="text-sm text-[#6B7280] mt-1">
                            {item.location}
                          </p>
                        </div>

                        <span className="inline-flex w-fit px-2.5 py-1 rounded-full bg-[#EEF4F7] text-[#164A63] text-xs font-medium">
                          {item.source}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-[#6B7280]">
                            From
                          </p>

                          <p className="font-medium text-[#1F2933]">
                            {item.fromDate
                              ? new Date(
                                  item.fromDate
                                ).toLocaleString()
                              : "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[#6B7280]">
                            To
                          </p>

                          <p className="font-medium text-[#1F2933]">
                            {item.toDate
                              ? new Date(
                                  item.toDate
                                ).toLocaleString()
                              : "Current"}
                          </p>
                        </div>
                      </div>

                      {item.remarks && (
                        <p className="mt-3 text-sm text-[#4B5563]">
                          <span className="font-medium">
                            Remarks:
                          </span>{" "}
                          {item.remarks}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-sm text-[#6B7280]">
                No ownership history available.
              </p>
            )}
          </div>
        </div>

        {/* Ownership observation */}
        <div className="bg-white border border-[#D9E0E5] rounded-xl mb-6">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <User
                size={19}
                className="text-[#164A63]"
              />

              <div>
                <h2 className="font-semibold text-[#1F2933]">
                  Ownership / Possession Observation
                </h2>

                <p className="text-xs text-[#6B7280] mt-1">
                  Record what the officer observes in the
                  field. This does not automatically change
                  the registered owner.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">

            <div className="bg-[#F5F7F8] border border-[#E1E7EB] rounded-lg p-4 mb-5">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    
    <div>
      <p className="text-xs text-[#6B7280]">
        Registered Owner
      </p>

      <p className="font-semibold text-[#1F2933] mt-1">
        {instrument.currentOwner || "-"}
      </p>
    </div>

    <div>
      <p className="text-xs text-[#6B7280]">
        Registered Location
      </p>

      <p className="font-semibold text-[#1F2933] mt-1">
        {instrument.installationLocation || "-"}
      </p>
    </div>

  </div>
</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className="block text-sm font-medium text-[#1F2933] mb-2">
                  Observed Owner / Possessor
                </label>

                <input
                  type="text"
                  value={observedOwner}
                  onChange={(e) =>
                    setObservedOwner(e.target.value)
                  }
                  placeholder="Enter observed owner / possessor"
                  className="w-full border border-[#CBD5DB] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#164A63]/20 focus:border-[#164A63]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2933] mb-2">
                  Observed Current Location
                </label>

                <input
                  type="text"
                  value={observedLocation}
                  onChange={(e) =>
                    setObservedLocation(e.target.value)
                  }
                  placeholder="Enter current location"
                  className="w-full border border-[#CBD5DB] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#164A63]/20 focus:border-[#164A63]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#1F2933] mb-2">
                  Observation Remarks
                </label>

                <textarea
                  value={ownershipRemarks}
                  onChange={(e) =>
                    setOwnershipRemarks(e.target.value)
                  }
                  rows={3}
                  placeholder="Add any relevant observation..."
                  className="w-full border border-[#CBD5DB] rounded-lg px-3 py-2.5 text-sm outline-none resize-none focus:ring-2 focus:ring-[#164A63]/20 focus:border-[#164A63]"
                />
              </div>
            </div>

            <div className="flex justify-end mt-5">
              <button
                type="button"
                onClick={submitOwnershipObservation}
                disabled={ownershipSubmitting}
                className="px-5 py-2.5 bg-[#164A63] text-white rounded-lg text-sm font-medium hover:bg-[#123D52] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {ownershipSubmitting
                  ? "Recording..."
                  : "Record Observation"}
              </button>
            </div>
          </div>
        </div>

        {/* Inspection checks */}
        <div className="bg-white border border-[#D9E0E5] rounded-xl mb-6">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <ClipboardCheck
                size={19}
                className="text-[#164A63]"
              />

              <h2 className="font-semibold text-[#1F2933]">
                Inspection Checks
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-6">

            {/* Physical */}
            <InspectionCheck
              title="Physical Condition"
              value={physicalCondition}
              onChange={setPhysicalCondition}
              options={[
                "Satisfactory",
                "Minor Issues",
                "Damaged",
              ]}
            />

            {/* Working */}
            <InspectionCheck
              title="Working Condition"
              value={workingCondition}
              onChange={setWorkingCondition}
              options={[
                "Working Properly",
                "Partially Working",
                "Not Working",
              ]}
            />

            {/* Accuracy */}
            <InspectionCheck
              title="Accuracy / Measurement Test"
              value={accuracyResult}
              onChange={setAccuracyResult}
              options={[
                "Within Permissible Limit",
                "Borderline",
                "Outside Permissible Limit",
              ]}
            />

          </div>
        </div>

        {/* Photos */}
        <div className="bg-white border border-[#D9E0E5] rounded-xl mb-6">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <Camera
                size={19}
                className="text-[#164A63]"
              />

              <h2 className="font-semibold text-[#1F2933]">
                Inspection Evidence
              </h2>
            </div>
          </div>

          <div className="p-6">

            <label className="block">
              <div className="border-2 border-dashed border-[#CBD5DB] rounded-xl p-7 text-center cursor-pointer hover:bg-[#F8FAFB]">
                <Upload
                  size={30}
                  className="mx-auto text-[#164A63] mb-3"
                />

                <p className="font-medium text-[#1F2933]">
                  Upload Inspection Photos
                </p>

                <p className="text-sm text-[#6B7280] mt-1">
                  Select photos captured during inspection.
                </p>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </label>

            {photos.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-[#1F2933] mb-2">
                  Selected Photos: {photos.length}
                </p>

                <div className="space-y-2">
                  {photos.map((photo, index) => (
                    <div
                      key={index}
                      className="text-sm text-[#4B5563] bg-[#F5F7F8] rounded-lg px-3 py-2"
                    >
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
              <FileText
                size={19}
                className="text-[#164A63]"
              />

              <h2 className="font-semibold text-[#1F2933]">
                Officer Remarks
              </h2>
            </div>
          </div>

          <div className="p-6">
            <textarea
              value={remarks}
              onChange={(e) =>
                setRemarks(e.target.value)
              }
              rows={5}
              placeholder="Enter inspection remarks..."
              className="w-full border border-[#CBD5DB] rounded-lg px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-[#164A63]/20 focus:border-[#164A63]"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="bg-white border border-[#D9E0E5] rounded-xl p-6">
          <div className="flex items-start gap-3 mb-6">
            <AlertCircle
              size={20}
              className="text-[#B7791F] mt-0.5"
            />

            <div>
              <p className="font-medium text-[#1F2933]">
                Complete the inspection before submitting
              </p>

              <p className="text-sm text-[#6B7280] mt-1">
                Ensure physical condition, working
                condition and accuracy checks are recorded.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">

            {/* PASS */}
            <button
              type="button"
              onClick={() => submitInspection("PASS")}
              disabled={inspectionSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <CheckCircle2 size={18} />

              {inspectionSubmitting
                ? "Submitting..."
                : "Pass Verification"}
            </button>

            {/* FAIL */}
            <button
              type="button"
              onClick={() => submitInspection("FAIL")}
              disabled={inspectionSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 border border-red-300 text-red-700 bg-white rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <XCircle size={18} />

              {inspectionSubmitting
                ? "Submitting..."
                : "Fail Verification"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// ======================================================
// Helper Components
// ======================================================

const InfoItem = ({
  label,
  value,
  status = false,
}) => {
  return (
    <div>
      <p className="text-xs text-[#6B7280] mb-1">
        {label}
      </p>

      {status ? (
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
            value === "Verified"
              ? "bg-green-100 text-green-700"
              : value === "Expired"
              ? "bg-red-100 text-red-700"
              : value === "Due Soon"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {value || "-"}
        </span>
      ) : (
        <p className="font-medium text-[#1F2933]">
          {value || "-"}
        </p>
      )}
    </div>
  );
};

const InspectionCheck = ({
  title,
  value,
  onChange,
  options,
}) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#1F2933] mb-3">
        {title}
      </label>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {options.map((option) => {
          const selected = value === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`text-left px-4 py-3 rounded-lg border text-sm transition ${
                selected
                  ? "border-[#164A63] bg-[#EEF4F7] text-[#164A63] font-medium"
                  : "border-[#D9E0E5] bg-white text-[#4B5563] hover:bg-[#F5F7F8]"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selected
                      ? "border-[#164A63]"
                      : "border-[#AAB5BC]"
                  }`}
                >
                  {selected && (
                    <div className="w-2 h-2 rounded-full bg-[#164A63]" />
                  )}
                </div>

                {option}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default InspectionDetails;