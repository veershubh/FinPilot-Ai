"use client"

import React from "react"
import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"

export function SuccessStep({ userName }: { userName: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="bg-[#111827] rounded-full p-6 border border-[#1F2937]"
      >
        <CheckCircle className="w-16 h-16 text-[#10B981]" />
      </motion.div>

      <h1 className="text-3xl font-bold text-white">Your Financial Profile is Ready 🎉</h1>
      <p className="text-[#94A3B8] max-w-md">
        {userName ? `${userName}, ` : ""}FinPilot AI is now personalized for smarter financial decisions.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <Button variant="primary" size="lg" className="min-w-[200px]" onClick={() => (window.location.href = "/dashboard")}>Enter Dashboard</Button>
        <Button variant="secondary" size="lg" className="min-w-[200px]" onClick={() => (window.location.href = "/profile")}>Review Profile</Button>
      </div>
    </div>
  )
}
