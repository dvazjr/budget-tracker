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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setLoading(true);
    setUploading(true);

    try {
      // Step 1: Upload file to Supabase
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

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

      // Show results - could display extracted debts here
      console.log("Analysis results:", analysis);

      // Reset and refresh
      if (e.target) {
        e.target.value = "";
      }

      onSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process file";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
          {error}
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
