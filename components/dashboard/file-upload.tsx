"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { extractTextFromPDF, extractTextFromImage } from "@/lib/pdfParser";

interface FileUploadProps {
  onSuccess: () => void;
}

export function FileUpload({ onSuccess }: FileUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const processFile = async (file: File, forceUpload = false) => {
    setError("");
    setLoading(true);
    setUploading(true);
    setDuplicateWarning(null);

    try {
      // Step 1: Upload file to Supabase
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      if (forceUpload) {
        uploadFormData.append("force", "true");
      }

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      // Check for duplicate warning
      if (uploadRes.status === 409) {
        const data = await uploadRes.json();
        setDuplicateWarning(data.message);
        setPendingFile(file);
        setLoading(false);
        setUploading(false);
        return;
      }

      if (!uploadRes.ok) {
        const data = await uploadRes.json();
        throw new Error(data.error || "Upload failed");
      }

      const uploadedData = await uploadRes.json();
      const fileId = uploadedData.file.id;

      setUploading(false);

      // Step 2: Extract text from file
      let textContent = "";

      if (file.type === "application/pdf") {
        textContent = await extractTextFromPDF(file);
      } else if (file.type.startsWith("image/")) {
        textContent = await extractTextFromImage(file);
      } else {
        throw new Error("Unsupported file type");
      }

      // Step 3: Send to analysis API
      const analysisRes = await fetch("/api/analyze-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId,
          pdfText: file.type === "application/pdf" ? textContent : null,
          imageBase64: file.type.startsWith("image/") ? textContent : null,
        }),
      });

      if (!analysisRes.ok) {
        const data = await analysisRes.json();
        throw new Error(data.error || "Analysis failed");
      }

      const analysis = await analysisRes.json();
      console.log("Analysis results:", analysis);

      setPendingFile(null);
      onSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process file";
      setError(errorMessage);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await processFile(file);

    // Reset input
    if (e.target) {
      e.target.value = "";
    }
  };

  const handleConfirmDuplicate = () => {
    if (pendingFile) {
      processFile(pendingFile, true);
    }
  };

  const handleCancelDuplicate = () => {
    setDuplicateWarning(null);
    setPendingFile(null);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {duplicateWarning && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-sm">
          <div className="mb-3 text-yellow-800">{duplicateWarning}</div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleConfirmDuplicate}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Upload Anyway
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelDuplicate}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition">
        <input
          type="file"
          accept=".pdf,image/jpeg,image/png,image/jpg"
          onChange={handleFileChange}
          disabled={loading}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer block"
        >
          <div className="text-4xl mb-2">📄</div>
          <p className="text-sm font-medium text-gray-700">
            {uploading ? "Uploading..." : "Click to upload or drag and drop"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PDF or image files up to 10MB
          </p>
        </label>
      </div>

      <Button
        type="button"
        onClick={() => document.getElementById("file-upload")?.click()}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Processing..." : "Select File"}
      </Button>
    </div>
  );
}
