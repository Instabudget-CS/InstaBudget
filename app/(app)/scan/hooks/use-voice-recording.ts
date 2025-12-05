import { useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { VOICE_EDGE_FUNCTION_URL } from "../constants";
import { transformTransactionToFormData } from "../utils";
import type {
  EdgeFunctionResponse,
  SavedTransaction,
  TransactionFormData,
} from "../types";

interface UseVoiceRecordingProps {
  onAutoSaveSuccess: (transaction: SavedTransaction) => void;
  onPreviewSuccess: (data: TransactionFormData) => void;
  onError: () => void;
}

export function useVoiceRecording({
  onAutoSaveSuccess,
  onPreviewSuccess,
  onError,
}: UseVoiceRecordingProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Error",
        description: "Failed to access microphone. Please check permissions.",
        variant: "destructive",
      });
      onError();
    }
  }, [onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  }, [isRecording]);

  const processAudio = useCallback(
    async (audioFile: File, userId: string, autoSave: boolean) => {
      try {
        const formData = new FormData();
        formData.append("audio_file", audioFile);
        formData.append("user_id", userId);
        formData.append("isAuto", autoSave ? "true" : "false");

        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.access_token) {
          throw new Error("No authentication token available");
        }

        const response = await fetch(VOICE_EDGE_FUNCTION_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.log(errorData);
          throw new Error(
            errorData.error || `Failed to process audio: ${response.statusText}`
          );
        }

        const result: EdgeFunctionResponse = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Failed to extract transaction data");
        }

        if (result.mode === "auto" && result.transaction) {
          const savedTx = result.transaction as SavedTransaction;
          onAutoSaveSuccess(savedTx);
        } else if (result.mode === "preview" && result.transaction) {
          const transformedData = transformTransactionToFormData(
            result.transaction
          );
          if (!transformedData) {
            throw new Error("Failed to transform transaction data");
          }
          onPreviewSuccess(transformedData);
        } else {
          throw new Error("Unexpected response format from edge function");
        }
      } catch (error) {
        console.error("Error processing audio:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to process audio. Please try again.",
          variant: "destructive",
        });
        onError();
      }
    },
    [onAutoSaveSuccess, onPreviewSuccess, onError]
  );

  const sendRecording = useCallback(
    async (userId: string, autoSave: boolean) => {
      if (audioChunksRef.current.length === 0) {
        toast({
          title: "Error",
          description: "No audio recorded. Please record again.",
          variant: "destructive",
        });
        return;
      }

      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      const audioFile = new File([audioBlob], "recording.webm", {
        type: "audio/webm",
      });

      await processAudio(audioFile, userId, autoSave);
    },
    [processAudio]
  );

  return {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    sendRecording,
  };
}
