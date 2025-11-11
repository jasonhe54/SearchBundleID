"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ExternalLink, Copy, Check, X } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Image from "next/image"
import DataItem from "@/lib/DataItem"
import { formatBytes, formatDate } from "@/lib/helpers"
import { useState } from "react"

export default function SingleAppView({
  results,
  fromDeveloperList,
  returnToSearch,
  clearResults,
  setViewMode,
  copyToClipboard,
}) {
  const [copiedField, setCopiedField] = useState(null)

  const handleCopy = (text, field) => {
    copyToClipboard(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl pb-4 -mx-4 md:-mx-6 px-4 md:px-6 flex items-center justify-between border-b border-border/40">
        <div>
          <h1 className="text-2xl font-semibold">App Details</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Complete app information</p>
        </div>
        <Button variant="ghost" size="icon" onClick={clearResults} className="h-9 w-9">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* App Header Card */}
      <Card className="border-border/40">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {results.icon && (
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-xl overflow-hidden ring-1 ring-border/40">
                  <Image
                    src={results.icon || "/placeholder.svg"}
                    alt={results.title || "App icon"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            )}

            <div className="flex-grow space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-grow min-w-0">
                  <h2 className="text-2xl md:text-3xl font-semibold mb-2 break-words">{results.title}</h2>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-sm text-muted-foreground">{results.developer}</span>
                    {results.free !== undefined && (
                      <Badge variant={results.free ? "default" : "secondary"} className="text-xs">
                        {results.free ? "Free" : `$${results.price}`}
                      </Badge>
                    )}
                    {results.contentRating && (
                      <Badge variant="outline" className="text-xs">{results.contentRating}</Badge>
                    )}
                    {results.primaryGenre && (
                      <Badge variant="outline" className="text-xs">{results.primaryGenre}</Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(results.url, "_blank")}
                  className="shrink-0 h-9 w-9"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                {results.version && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Version</p>
                    <p className="text-sm font-medium">{results.version}</p>
                  </div>
                )}
                {results.size && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Size</p>
                    <p className="text-sm font-medium">{formatBytes(results.size)}</p>
                  </div>
                )}
                {results.released && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Released</p>
                    <p className="text-sm font-medium">{formatDate(results.released)}</p>
                  </div>
                )}
                {results.updated && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Updated</p>
                    <p className="text-sm font-medium">{formatDate(results.updated)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/40">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-4">Identifiers</h3>
            <div className="space-y-3">
              <DataItem
                label="App Store URL"
                value={results.url}
                copyable
                onCopy={() => handleCopy(results.url, "url")}
              />
              <Separator className="bg-border/40" />
              <DataItem
                label="Bundle ID"
                value={results.appId}
                copyable
                onCopy={() => handleCopy(results.appId, "bundleId")}
              />
              <Separator className="bg-border/40" />
              <DataItem
                label="App ID"
                value={results.id}
                copyable
                onCopy={() => handleCopy(results.id, "appId")}
              />
              <Separator className="bg-border/40" />
              <DataItem
                label="Developer ID"
                value={results.developerId}
                copyable
                onCopy={() => handleCopy(results.developerId, "developerId")}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-4">Information</h3>
            <div className="space-y-3">
              {results.version && (
                <>
                  <DataItem
                    label="Version"
                    value={results.version}
                    copyable
                    onCopy={() => handleCopy(results.version, "version")}
                  />
                  <Separator className="bg-border/40" />
                </>
              )}
              {results.size && (
                <>
                  <DataItem
                    label="Size"
                    value={formatBytes(results.size)}
                    copyable
                    onCopy={() => handleCopy(formatBytes(results.size), "size")}
                  />
                  <Separator className="bg-border/40" />
                </>
              )}
              {results.requiredOsVersion && (
                <>
                  <DataItem
                    label="Required OS"
                    value={results.requiredOsVersion}
                    copyable
                    onCopy={() => handleCopy(results.requiredOsVersion, "os")}
                  />
                  <Separator className="bg-border/40" />
                </>
              )}
              {results.released && (
                <>
                  <DataItem
                    label="Released"
                    value={formatDate(results.released)}
                    copyable
                    onCopy={() => handleCopy(formatDate(results.released), "released")}
                  />
                  <Separator className="bg-border/40" />
                </>
              )}
              {results.updated && (
                <DataItem
                  label="Updated"
                  value={formatDate(results.updated)}
                  copyable
                  onCopy={() => handleCopy(formatDate(results.updated), "updated")}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {results.description && (
        <Card className="border-border/40">
          <CardContent className="p-5">
            <Accordion type="single" collapsible>
              <AccordionItem value="description" className="border-none">
                <AccordionTrigger className="text-sm font-semibold py-0">Description</AccordionTrigger>
                <AccordionContent className="pt-4">
                  <p className="text-sm text-muted-foreground whitespace-pre-line mb-4 leading-relaxed">
                    {results.description}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleCopy(results.description, "description")}
                  >
                    {copiedField === "description" ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Description
                      </>
                    )}
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
