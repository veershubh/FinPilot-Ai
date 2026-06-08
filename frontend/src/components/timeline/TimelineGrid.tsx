// src/components/timeline/TimelineGrid.tsx
"use client";

import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { TimelineCard } from "./TimelineCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AddCommitmentModal } from "@/components/timeline/AddCommitmentModal";
import type { FinancialTimeline } from "@/types/database";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function TimelineGrid() {
  const { data, error, mutate } = useSWR<FinancialTimeline[]>("/api/timeline", fetcher);
  const [modalOpen, setModalOpen] = useState(false);

  if (error) return <p className="text-red-500">Failed to load timeline.</p>;
  if (!data) return <p className="text-[#64748B]">Loading commitments…</p>;

  return (
    <Card className="p-6 bg-[#111827] border-[#1F2937]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-xl font-semibold">Your Commitments</h2>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          + Add Commitment
        </Button>
      </div>
      {data.length === 0 ? (
        <p className="text-[#94A3B8]">No commitments yet. Add one to get started.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => (
            <TimelineCard key={item.id} item={item} />
          ))}
        </div>
      )}
      <AddCommitmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => mutate()}
      />
    </Card>
  );
}
