"use client"

import { memo } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clipboard } from "lucide-react"
import { formatDate, formatBytes } from "@/lib/helpers"
import Image from "next/image"

// Simple version of AppItem that shows app size and avoids re-render issues
const AppItem = memo(function AppItem({ app, index, setResults, setFromDeveloperList, setViewMode, copyToClipboard }) {
  if (!app) return null;

  // Handle view details click
  function handleViewDetails() {
    setResults(app)
    setFromDeveloperList(true)
    setViewMode("single")
  }

  // Handle copy click
  function handleCopy(e) {
    e.stopPropagation()
    const idToCopy = app.appId || app.bundleId || "";
    copyToClipboard(idToCopy)
  }

  // Extract display values with fallbacks
  const displayTitle = app.title || app.appName || "Unknown App";
  const displayIcon = app.icon || app.artworkUrl512;
  const displayVersion = app.version || "";
  const displayDate = app.updated || app.lastUpdated || "";
  const isFree = app.free === true || app.price === 0;
  const displayPrice = isFree ? "Free" : (app.price ? `$${app.price}` : "");
  const displayRating = app.contentRating || "";
  const displayGenre = app.primaryGenre || app.genre || "";
  
  // Get app size data with fallbacks
  const fileSizeBytes = app.size || app.fileSizeBytes || 0;
  const displaySize = formatBytes(fileSizeBytes);

  return (
    <motion.div
      className="border dark:border-zinc-700 rounded-lg p-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
      onClick={handleViewDetails}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      {displayIcon ? (
        <Image
          src={displayIcon}
          alt={displayTitle}
          width={60}
          height={60}
          className="rounded-lg"
          unoptimized={true}
        />
      ) : (
        <div className="w-[60px] h-[60px] rounded-lg bg-gray-200 dark:bg-zinc-700 flex items-center justify-center">
          <span className="text-2xl">📱</span>
        </div>
      )}

      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-base dark:text-white">{displayTitle}</h3>
          <div className="flex gap-1 ml-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7"
              onClick={handleCopy}
              title="Copy Bundle ID"
            >
              <Clipboard className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="w-7 h-7">
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs">
              {displayVersion ? `v${displayVersion}` : ""} • Updated: {formatDate(displayDate)}
            </span>
            {displaySize !== "0 B" && (
              <span className="text-xs ml-2">
                {displaySize}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {displayPrice && (
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-700 rounded-full text-xs">
                {displayPrice}
              </span>
            )}
            {displayRating && (
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-700 rounded-full text-xs">
                {displayRating}
              </span>
            )}
            {displayGenre && (
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-700 rounded-full text-xs">
                {displayGenre}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
})

export default AppItem