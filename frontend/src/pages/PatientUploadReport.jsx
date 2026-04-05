import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { CheckCircle2, Loader2, UploadCloud } from "lucide-react";
import { uploadPatientReport } from "../services/patientReportService.js";

const REPORT_TYPES = [
  "Blood Test",
  "Urine Test",
  "X-Ray",
  "MRI Scan",
  "CT Scan",
  "Ultrasound",
  "ECG / EKG",
  "Echocardiogram",
  "Prescription",
  "Discharge Summary",
  "Pathology Report",
  "Radiology Report",
  "Vaccination Record",
  "Allergy Test",
  "COVID-19 Test",
  "Biopsy Report",
  "Dental Record",
  "Ophthalmology Report",
  "Other",
];

const ACCEPTED = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/tiff",
  "application/dicom",
  "application/octet-stream",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const fmtSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function PatientUploadReport() {
  const [form, setForm] = useState({
    reportName: "",
    reportType: "",
    reportDate: "",
    notes: "",
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  const fileAcceptAttr = useMemo(
    () => ".pdf,.jpg,.jpeg,.png,.webp,.tiff,.tif,.dcm,.doc,.docx",
    []
  );

  const validate = () => {
    const next = {};
    if (!form.reportName.trim()) next.reportName = "Report name is required";
    if (!file) next.file = "Report file is required";

    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        next.file = "File size must be 25MB or less";
      }
      const ext = file.name.split(".").pop()?.toLowerCase();
      const extAllowed = ["pdf", "jpg", "jpeg", "png", "webp", "tiff", "tif", "dcm", "doc", "docx"].includes(ext);
      if (!ACCEPTED.includes(file.type) && !extAllowed) {
        next.file = "Invalid file type. Use PDF/JPG/PNG/WEBP/TIFF/DOC/DOCX/DICOM.";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setUploading(true);
      await uploadPatientReport({
        reportName: form.reportName,
        reportType: form.reportType,
        reportDate: form.reportDate,
        notes: form.notes,
        file,
      });

      toast.success("Report uploaded successfully. It is marked as Self Uploaded.");
      setForm({ reportName: "", reportType: "", reportDate: "", notes: "" });
      setFile(null);
      setErrors({});
      const input = document.getElementById("patient-report-file");
      if (input) input.value = "";
    } catch (error) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dash-page">
      <div className="mv-card" style={{ maxWidth: 760, margin: "0 auto" }}>
        <div className="mv-card-header patient-upload-intro">
          <div>
            <p className="mv-card-title">Upload Your Report</p>
            <p style={{ fontSize: "0.82rem", color: "var(--mv-slate)", marginTop: 2 }}>
              Add your own medical report. Self uploads are marked as unverified until reviewed.
            </p>
          </div>
          <span className="mv-badge mv-badge-amber">Self Upload</span>
        </div>

        <div className="mv-card-body patient-upload-body">
          <form onSubmit={onSubmit} style={{ display: "grid", gap: "1rem" }}>
            <div>
              <label className="mv-label" style={{ marginBottom: 6, display: "block" }}>
                Report Name <span style={{ color: "var(--mv-danger)" }}>*</span>
              </label>
              <input
                className="mv-input"
                value={form.reportName}
                onChange={(e) => setForm((p) => ({ ...p, reportName: e.target.value }))}
                placeholder="e.g., Blood Test - March"
              />
              {errors.reportName && <p className="mv-field-error">{errors.reportName}</p>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
              <div>
                <label className="mv-label" style={{ marginBottom: 6, display: "block" }}>Report Type (Optional)</label>
                <select
                  className="mv-select"
                  value={form.reportType}
                  onChange={(e) => setForm((p) => ({ ...p, reportType: e.target.value }))}
                >
                  <option value="">Select Type</option>
                  {REPORT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mv-label" style={{ marginBottom: 6, display: "block" }}>Report Date (Optional)</label>
                <input
                  type="date"
                  className="mv-input"
                  max={new Date().toISOString().split("T")[0]}
                  value={form.reportDate}
                  onChange={(e) => setForm((p) => ({ ...p, reportDate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="mv-label" style={{ marginBottom: 6, display: "block" }}>
                File Upload <span style={{ color: "var(--mv-danger)" }}>*</span>
              </label>
              <input
                id="patient-report-file"
                type="file"
                accept={fileAcceptAttr}
                className="mv-input"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setErrors((p) => ({ ...p, file: "" }));
                }}
              />
              <p style={{ fontSize: "0.75rem", color: "var(--mv-slate)", marginTop: 6 }}>
                PDF, JPG, PNG, WEBP, TIFF, DOC, DOCX, DICOM · Max 25MB
              </p>
              {file && (
                <p style={{ fontSize: "0.8rem", color: "var(--mv-slate-dark)", marginTop: 6 }}>
                  Selected: <strong>{file.name}</strong> ({fmtSize(file.size)})
                </p>
              )}
              {errors.file && <p className="mv-field-error">{errors.file}</p>}
            </div>

            <div>
              <label className="mv-label" style={{ marginBottom: 6, display: "block" }}>Notes (Optional)</label>
              <textarea
                className="mv-textarea"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Any additional context"
              />
            </div>

            <button
              type="submit"
              className="mv-btn mv-btn-primary"
              disabled={uploading}
              style={{ width: "fit-content", gap: 8 }}
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
              {uploading ? "Uploading..." : "Upload Your Report"}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <CheckCircle2 size={14} color="var(--mv-warning)" />
              <span style={{ fontSize: "0.78rem", color: "var(--mv-slate)" }}>
                Reports uploaded by patients are shown with a <strong>Self Uploaded</strong> badge.
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
