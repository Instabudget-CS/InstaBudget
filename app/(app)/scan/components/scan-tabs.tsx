"use client";

import { Camera, Edit3, Mic } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TabMode } from "../types";

interface ScanTabsProps {
  activeTab: TabMode;
  onTabChange: (tab: TabMode) => void;
  scanContent: React.ReactNode;
  manualContent: React.ReactNode;
  voiceContent: React.ReactNode;
}

export function ScanTabs({
  activeTab,
  onTabChange,
  scanContent,
  manualContent,
  voiceContent,
}: ScanTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => onTabChange(v as TabMode)}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="scan" className="gap-2">
          <Camera className="h-4 w-4" />
          Scan Receipt
        </TabsTrigger>
        <TabsTrigger value="voice" className="gap-2">
          <Mic className="h-4 w-4" />
          Voice Entry
        </TabsTrigger>
        <TabsTrigger value="manual" className="gap-2">
          <Edit3 className="h-4 w-4" />
          Manual Entry
        </TabsTrigger>
      </TabsList>

      <TabsContent value="scan" className="mt-6">
        {scanContent}
      </TabsContent>

      <TabsContent value="voice" className="mt-6">
        {voiceContent}
      </TabsContent>

      <TabsContent value="manual" className="mt-6">
        {manualContent}
      </TabsContent>
    </Tabs>
  );
}
