import { useState } from "react";
import { Upload, CheckCircle2, FileText } from "lucide-react";

export default function DataPlateChecker({ onOcrComplete }) {
  const [preview, setPreview] = useState(null);
  const [isPdf, setIsPdf] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === "application/pdf") {
      setPreview(null);
      setIsPdf(true);
      // Pass the file up; the backend will handle the OCR/Verification
      onOcrComplete(file, null); 
    } else {
      setPreview(URL.createObjectURL(file));
      setIsPdf(false);
      // Pass the file up; the backend will handle the OCR/Verification
      onOcrComplete(file, null); 
    }
  };

  return (
    <div className="rounded-xl border border-[#D9E0E5] bg-white p-6 mb-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[#1F2933]">Upload Invoice / Bill</h2>
        <p className="text-sm text-slate-500">
          Provide the GST Invoice or Bill. Our secure system will automatically verify the document details upon submission.
        </p>
      </div>

      <div>
        <label className="block border-2 border-dashed border-[#CBD5DB] rounded-xl p-6 text-center cursor-pointer hover:bg-slate-50 transition">
          {preview ? (
            <div>
              <img src={preview} alt="GST Invoice" className="max-h-48 mx-auto rounded-lg object-contain mb-3" />
              <p className="font-medium text-green-700 flex items-center justify-center gap-2">
                <CheckCircle2 size={18} /> Image Attached Successfully
              </p>
              <p className="text-sm text-slate-500 mt-1">Ready for submission</p>
            </div>
          ) : isPdf ? (
            <div className="py-6">
              <FileText size={36} className="mx-auto text-[#164A63] mb-3" />
              <p className="font-medium text-green-700 flex items-center justify-center gap-2">
                <CheckCircle2 size={18} /> PDF Attached Successfully
              </p>
              <p className="text-sm text-slate-500 mt-1">Ready for submission</p>
            </div>
          ) : (
            <div className="py-6">
              <Upload size={30} className="mx-auto text-[#164A63] mb-3" />
              <p className="font-medium text-[#1F2933]">Click to upload Bill / GST Invoice</p>
              <p className="text-xs text-slate-500 mt-1">JPG, PNG, or PDF</p>
            </div>
          )}
          <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={handleImageUpload} />
        </label>
      </div>
    </div>
  );
}