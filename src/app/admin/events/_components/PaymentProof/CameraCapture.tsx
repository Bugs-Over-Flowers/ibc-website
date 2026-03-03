"use client";

import { CameraIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  disabled?: boolean;
  onCapture: (file: File) => void;
}

export default function CameraCapture({
  disabled = false,
  onCapture,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const startCamera = async () => {
      setIsStarting(true);
      setCameraError(null);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: "environment",
          },
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        if (isMounted) {
          setCameraError(
            "Unable to access camera. Please allow permission and try again.",
          );
        }
      } finally {
        if (isMounted) {
          setIsStarting(false);
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    };
  }, []);

  const handleCapture = async () => {
    const videoElement = videoRef.current;

    if (
      !videoElement ||
      videoElement.videoWidth === 0 ||
      videoElement.videoHeight === 0
    ) {
      setCameraError("Camera feed is not ready yet. Please try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError("Failed to capture image. Please try again.");
      return;
    }

    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.9);
    });

    if (!blob) {
      setCameraError("Failed to process captured image. Please try again.");
      return;
    }

    const file = new File([blob], `proof-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });

    onCapture(file);
  };

  return (
    <div className="space-y-3">
      <div className="relative h-[420px] w-full overflow-hidden rounded-md border bg-black">
        {isStarting && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-white/80">
            Starting camera...
          </div>
        )}

        {!cameraError && (
          <video
            autoPlay
            className="h-full w-full object-cover"
            muted
            playsInline
            ref={videoRef}
          />
        )}

        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-white/90">
            {cameraError}
          </div>
        )}
      </div>

      <Button
        className="w-full"
        disabled={disabled || isStarting || !!cameraError}
        onClick={handleCapture}
      >
        <CameraIcon />
        Capture Photo
      </Button>
    </div>
  );
}
