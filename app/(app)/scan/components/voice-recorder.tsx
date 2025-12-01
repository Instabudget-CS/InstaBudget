"use client";

import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface VoiceRecorderProps {
  isRecording: boolean;
  recordingTime: number;
  isAutoSave: boolean;
  isProcessing: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onAutoSaveChange: (autoSave: boolean) => void;
}

export function VoiceRecorder({
  isRecording,
  recordingTime,
  isAutoSave,
  isProcessing,
  onStartRecording,
  onStopRecording,
  onAutoSaveChange,
}: VoiceRecorderProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voice Transaction</CardTitle>
        <CardDescription>
          Record your purchase description and we&apos;ll extract the
          transaction details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isRecording ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-red-200 bg-red-50 p-8 dark:bg-red-950/20 dark:border-red-900">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 animate-pulse dark:bg-red-900/30">
                <Mic className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
                Recording in progress...
              </p>
              <p className="text-4xl font-bold text-red-600 dark:text-red-400 mb-6">
                {formatTime(recordingTime)}
              </p>
              <Button
                onClick={onStopRecording}
                size="lg"
                className="gap-2 min-w-[200px] text-lg py-6 bg-red-600 hover:bg-red-700 text-white border-2 border-red-700 shadow-lg"
              >
                <Square className="h-5 w-5" />
                Stop & Submit
              </Button>
              <p className="text-xs text-muted-foreground mt-3 text-center max-w-xs">
                Click &quot;Stop & Submit&quot; when you&apos;re done speaking
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Mic className="h-8 w-8 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Ready to record</p>
                <p className="text-xs text-muted-foreground">
                  Click to start recording your transaction
                </p>
              </div>
            </div>

            <Button
              onClick={onStartRecording}
              size="lg"
              className="gap-2 bg-green-500 hover:bg-green-600"
              disabled={isProcessing}
            >
              <Mic className="h-4 w-4" />
              Start Recording
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="auto-save-voice">Auto-save transaction</Label>
            <p className="text-xs text-muted-foreground">
              {isAutoSave
                ? "Automatically save without preview"
                : "Review and edit before saving"}
            </p>
          </div>
          <Switch
            id="auto-save-voice"
            checked={isAutoSave}
            onCheckedChange={onAutoSaveChange}
            disabled={isProcessing || isRecording}
          />
        </div>

        {isProcessing && (
          <div className="flex items-center justify-center gap-2 rounded-lg border p-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Processing your recording...
            </p>
          </div>
        )}

        <div className="rounded-lg bg-green-50 p-4 text-sm dark:bg-green-950">
          <p className="font-medium mb-2">Example phrases:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>&quot;I bought a potato for 2.99 dollars at Sprouts&quot;</li>
            <li>&quot;Spent 15 dollars on groceries at Whole Foods&quot;</li>
            <li>&quot;Coffee for 5.50 at Starbucks&quot;</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
