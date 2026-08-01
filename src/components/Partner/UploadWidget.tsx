import React, { useEffect, useState, useRef } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface UploadWidgetProps {
  storeId: string;
  authToken: string;
  onUploadComplete: (secureUrl: string, publicId: string) => void;
}

export default function UploadWidget({ storeId, authToken, onUploadComplete }: UploadWidgetProps) {
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [signatureData, setSignatureData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "fetching_sig" | "ready" | "uploading" | "success" | "failed">("idle");
  const [progress, setProgress] = useState(0);
  const widgetRef = useRef<any>(null);

  // 1. Dynamic Script Loader
  useEffect(() => {
    // Check if script is already present
    if ((window as any).cloudinary) {
      setWidgetLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://upload-widget.cloudinary.com/global/all.js";
    script.async = true;
    script.onload = () => setWidgetLoaded(true);
    script.onerror = () => {
      setError("Failed to load Cloudinary Upload Widget script.");
      setStatus("failed");
    };
    document.body.appendChild(script);
  }, []);

  // 2. Fetch signature
  const fetchSignature = async () => {
    setStatus("fetching_sig");
    setError(null);
    try {
      const res = await fetch("/api/partner/upload-signature", {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate signature.");
      }
      const data = await res.json();
      setSignatureData(data);
      setStatus("ready");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load upload signature.");
      setStatus("failed");
    }
  };

  useEffect(() => {
    if (authToken && storeId) {
      fetchSignature();
    }
  }, [authToken, storeId]);

  // 3. Initialize Cloudinary widget
  const openWidget = () => {
    if (!widgetLoaded || !signatureData) {
      setError("Widget script or signature is not ready.");
      return;
    }

    // Configure Cloudinary Widget
    widgetRef.current = (window as any).cloudinary.createUploadWidget(
      {
        cloudName: signatureData.cloudName,
        apiKey: signatureData.apiKey,
        uploadSignature: signatureData.signature,
        uploadSignatureTimestamp: signatureData.timestamp,
        uploadPreset: signatureData.uploadPreset,
        tags: [signatureData.tags],
        sources: ["local", "url", "camera"],
        multiple: false,
        cropping: false,
        theme: "minimal",
        styles: {
          palette: {
            window: "#FFFFFF",
            windowBorder: "#E5DEC9",
            tabIcon: "#C27664",
            menuIcons: "#1C1C1A",
            textDark: "#1C1C1A",
            textLight: "#FFFFFF",
            link: "#C27664",
            action: "#C27664",
            inactiveTabIcon: "#666666",
            error: "#D97706",
            inProgress: "#C27664",
            complete: "#10B981",
            sourceBg: "#FAF9F6"
          }
        }
      },
      (error: any, result: any) => {
        if (error) {
          setError(error.message || "Upload encountered an error.");
          setStatus("failed");
          return;
        }

        if (result.event === "upload-started") {
          setStatus("uploading");
          setProgress(10);
        } else if (result.event === "upload-progress") {
          setProgress(Math.round(result.info.progress || 50));
        } else if (result.event === "success") {
          setStatus("success");
          setProgress(100);
          if (onUploadComplete) {
            onUploadComplete(result.info.secure_url, result.info.public_id);
          }
        }
      }
    );

    widgetRef.current.open();
  };

  return (
    <div className="w-full">
      <div
        onClick={status === "ready" || status === "success" || status === "failed" ? openWidget : undefined}
        className={`w-full min-h-[160px] border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative select-none ${
          status === "ready"
            ? "border-brand-warm-gray/40 hover:border-brand-terracotta hover:bg-brand-sand/5"
            : status === "uploading"
            ? "border-brand-terracotta/40 bg-brand-sand/5 cursor-wait"
            : status === "success"
            ? "border-emerald-500/40 bg-emerald-50/5"
            : "border-brand-warm-gray/20 bg-brand-warm-gray/5"
        }`}
      >
        {status === "fetching_sig" && (
          <div className="flex flex-col items-center space-y-2 text-brand-charcoal/50">
            <RefreshCw className="w-8 h-8 animate-spin text-brand-terracotta" />
            <span className="text-xs font-mono">Negotiating secure signature...</span>
          </div>
        )}

        {status === "ready" && (
          <div className="flex flex-col items-center space-y-2">
            <UploadCloud className="w-10 h-10 text-brand-terracotta/80 transition-transform duration-300" />
            <span className="text-sm font-semibold text-brand-charcoal">Upload Product Shelfie</span>
            <span className="text-[10px] font-mono text-brand-charcoal/40 uppercase">Drag & Drop or Click to Select File</span>
          </div>
        )}

        {status === "uploading" && (
          <div className="flex flex-col items-center space-y-3 w-full max-w-[200px]">
            <RefreshCw className="w-8 h-8 animate-spin text-brand-terracotta" />
            <span className="text-xs font-mono text-brand-charcoal/60">Uploading to Cloudinary...</span>
            <div className="w-full h-1 bg-brand-warm-gray/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-terracotta transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            <span className="text-sm font-semibold text-emerald-600">Upload Complete</span>
            <span className="text-[10px] font-mono text-brand-charcoal/40 uppercase">Click to replace image</span>
          </div>
        )}

        {status === "failed" && (
          <div className="flex flex-col items-center space-y-2">
            <AlertCircle className="w-10 h-10 text-brand-terracotta" />
            <span className="text-sm font-semibold text-brand-terracotta">Upload Failed</span>
            <span className="text-xs font-mono text-brand-charcoal/50 text-center max-w-[250px]">{error}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                fetchSignature();
              }}
              className="mt-2 px-3 py-1 bg-brand-charcoal text-white text-[10px] font-mono uppercase"
            >
              Retry Connection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
