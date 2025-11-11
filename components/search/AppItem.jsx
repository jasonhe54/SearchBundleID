"use client"

import { memo } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Clipboard } from "lucide-react"
import { formatDate, formatBytes } from "@/lib/helpers"
import Image from "next/image"

const AppItem = memo(function AppItem({ app, index, setResults, setFromDeveloperList, setViewMode, copyToClipboard, viewMode = "list" }) {
  if (!app) return null;

  function handleViewDetails() {
    setResults(app)
    setFromDeveloperList(true)
    setViewMode("single")
  }

  function handleCopy(e) {
    e.stopPropagation()
    const idToCopy = app.appId || app.bundleId || "";
    copyToClipboard(idToCopy)
  }

  const displayTitle = app.title || app.appName || "Unknown App";
  const displayIcon = app.icon || app.artworkUrl512;
  const displayVersion = app.version || "";
  const displayDate = app.updated || app.lastUpdated || "";
  const isFree = app.free === true || app.price === 0;
  const displayPrice = isFree ? "Free" : (app.price ? `$${app.price}` : "");
  const displayRating = app.contentRating || "";
  const displayGenre = app.primaryGenre || app.genre || "";
  const fileSizeBytes = app.size || app.fileSizeBytes || 0;
  const displaySize = formatBytes(fileSizeBytes);

  const isGridLayout = viewMode === "grid";

  if (isGridLayout) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.03, duration: 0.2 }}
      >
        <Card
          className="h-full cursor-pointer hover:border-primary/50 transition-all duration-200 group border-border/40"
          onClick={handleViewDetails}
        >
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              <div className="flex justify-center">
                {displayIcon ? (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden ring-1 ring-border/40">
                    <Image
                      src={displayIcon}
                      alt={displayTitle}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-3xl">📱</span>
                  </div>
                )}
              </div>

              <div className="text-center">
                <h3 className="font-medium text-sm line-clamp-2 mb-1">{displayTitle}</h3>
                {displayVersion && (
                  <p className="text-xs text-muted-foreground mb-2">v{displayVersion}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {displayPrice && (
                  <Badge variant={isFree ? "default" : "secondary"} className="text-xs">
                    {displayPrice}
                  </Badge>
                )}
                {displayRating && (
                  <Badge variant="outline" className="text-xs">
                    {displayRating}
                  </Badge>
                )}
              </div>

              <div className="text-xs text-muted-foreground text-center space-y-1 pt-1 border-t border-border/40">
                {displayDate && (
                  <p>Updated: {formatDate(displayDate)}</p>
                )}
                {displaySize !== "0 B" && (
                  <p>{displaySize}</p>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  onClick={handleCopy}
                  title="Copy Bundle ID"
                >
                  <Clipboard className="h-3 w-3 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                  View
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card
        className="cursor-pointer hover:border-primary/50 transition-all duration-200 group border-border/40"
        onClick={handleViewDetails}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {displayIcon ? (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden ring-1 ring-border/40 flex-shrink-0">
                <Image
                  src={displayIcon}
                  alt={displayTitle}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📱</span>
              </div>
            )}

            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="font-semibold text-sm line-clamp-1">{displayTitle}</h3>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleCopy}
                    title="Copy Bundle ID"
                  >
                    <Clipboard className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-2">
                {displayVersion && (
                  <span className="text-xs text-muted-foreground">v{displayVersion}</span>
                )}
                {displayDate && (
                  <span className="text-xs text-muted-foreground">
                    Updated: {formatDate(displayDate)}
                  </span>
                )}
                {displaySize !== "0 B" && (
                  <span className="text-xs text-muted-foreground">{displaySize}</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {displayPrice && (
                  <Badge variant={isFree ? "default" : "secondary"} className="text-xs">
                    {displayPrice}
                  </Badge>
                )}
                {displayRating && (
                  <Badge variant="outline" className="text-xs">
                    {displayRating}
                  </Badge>
                )}
                {displayGenre && (
                  <Badge variant="outline" className="text-xs">
                    {displayGenre}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
})

export default AppItem
