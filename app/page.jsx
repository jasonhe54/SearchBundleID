"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { toast } from "sonner"
import { Moon, Sun, Copy, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

export default function Home() {
  // Input state tracking
  const [appStoreUrl, setAppStoreUrl] = useState("")
  const [appstoreId, setAppStoreId] = useState("")
  const [bundleId, setBundleId] = useState("")
  const [includeRatings, setIncludeRatings] = useState(false)

  // Results state
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Function to handle API request
  const handleSearch = () => {
    if (!appstoreId && !bundleId) {
      alert("Please fill at either App ID or Bundle ID.")
      return
    }

    setLoading(true)

    fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        appStoreUrl,
        appstoreId,
        bundleId,
        includeRatings,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setResults(data)
        setAppStoreUrl(data.url || "")
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error:", error)
        setLoading(false)
        alert("An error occurred while fetching data.")
      })
  }

  // Function to clear results
  const clearResults = () => {
    setResults(null)
    setAppStoreUrl("")
    setAppStoreId("")
    setBundleId("")
    setIncludeRatings(false)
    setLoading(false)
  }

  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast("Copied to clipboard!", {
          description: text,
          duration: 2000,
        })
      })
      .catch((err) => {
        console.error("Failed to copy: ", err)
      })
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  return (
    <div
      className={`flex items-center justify-center min-h-screen p-4 ${isDarkMode ? "dark bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 relative w-full max-w-4xl mx-auto">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
          <div className="flex justify-end mb-4">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} aria-label="Toggle dark mode">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>

          <h1 className="text-2xl font-bold mb-2 text-center dark:text-white">Search BundleID</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 text-center">
            Complete a field below to search for an App Store Bundle ID, or an App ID.
          </p>

          <div className="space-y-4">
            {/* <div className="relative">
              <Input
                type="text"
                placeholder="App Store URL"
                className="pr-10 dark:bg-gray-700 dark:text-white dark:border-gray-600 w:80"
                value={appStoreUrl}
                onChange={(e) => setAppStoreUrl(e.target.value)}
                disabled
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => navigator.clipboard.writeText(appStoreUrl || "")}
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy</span>
              </Button>
            </div> */}

            <Input
              type="text"
              placeholder="Enter App ID"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              autoCapitalize="off"
              value={appstoreId}
              onChange={(e) => setAppStoreId(e.target.value)}
            />

            <Input
              type="text"
              placeholder="Enter Bundle ID"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              autoCapitalize="off"
              value={bundleId}
              onChange={(e) => setBundleId(e.target.value)}
            />

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="ratings"
                checked={includeRatings}
                onCheckedChange={(checked) => setIncludeRatings(checked)}
                className="dark:border-gray-500"
              />
              <Label htmlFor="ratings" className="cursor-pointer dark:text-white">
                Include ratings
              </Label>
            </div>

            <Button className="w-full mt-4" onClick={handleSearch} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>

          <div className="mt-8 text-xs text-gray-500 dark:text-gray-400 flex gap-2 justify-center">
            <a href="#" className="hover:underline">
              github
            </a>
          </div>
        </div>

        <AnimatePresence>
          {results && (
            <motion.div
              className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold dark:text-white">Results</h2>
                <Button variant="outline" size="sm" onClick={clearResults} className="text-gray-600 dark:text-gray-300">
                  Clear
                </Button>
              </div>

              <div className="flex items-start gap-4 mb-6">
                {results.icon && (
                  <div className="flex-shrink-0">
                    <Image
                      src={results.icon || "/placeholder.svg"}
                      alt={results.title || "App icon"}
                      width={80}
                      height={80}
                      className="rounded-xl"
                    />
                  </div>
                )}
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h1 className="text-2xl font-bold dark:text-white">{results.title}</h1>
                    <div className="ml-auto flex gap-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(results.url, "_blank")}
                        className="h-8 w-8"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span>{results.developer}</span>
                    {results.free !== undefined && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                        {results.free ? "Free" : `$${results.price}`}
                      </span>
                    )}
                    {results.contentRating && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                        {results.contentRating}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-4">
                <DataItem label="App Store URL" value={results.url} copyable onCopy={() => copyToClipboard(results.url)} />
                <DataItem
                  label="Bundle ID"
                  value={results.appId}
                  copyable
                  onCopy={() => copyToClipboard(results.appId)}
                />
                <DataItem label="App ID" value={results.id} copyable onCopy={() => copyToClipboard(results.id)} />
                <DataItem
                  label="Version"
                  value={results.version}
                  copyable
                  onCopy={() => copyToClipboard(results.version)}
                />
                <DataItem
                  label="Size"
                  value={formatBytes(results.size)}
                  copyable
                  onCopy={() => copyToClipboard(formatBytes(results.size))}
                />
                <DataItem
                  label="Released"
                  value={formatDate(results.released)}
                  copyable
                  onCopy={() => copyToClipboard(formatDate(results.released))}
                />
                <DataItem
                  label="Updated"
                  value={formatDate(results.updated)}
                  copyable
                  onCopy={() => copyToClipboard(formatDate(results.updated))}
                />
                <DataItem
                  label="Required OS"
                  value={results.requiredOsVersion}
                  copyable
                  onCopy={() => copyToClipboard(results.requiredOsVersion)}
                />
                <DataItem
                  label="Primary Genre"
                  value={results.primaryGenre}
                  copyable
                  onCopy={() => copyToClipboard(results.primaryGenre)}
                />
              </div>

              {results.description && (
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Description</AccordionTrigger>
                    <AccordionContent className={"text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line"}>
                      <div className="pb-4">
                        {results.description}
                      </div>
                      {/* <hr/> */}
                      <Button variant="secondary" className={"w-full"} onClick={() => {
                        toast("Event has been created.")
                        copyToClipboard(results.description)
                        }}>Copy Description</Button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              {/* {results.description && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold dark:text-white">Description</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(results.description)}
                      className="h-8 w-8"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{results.description}</p>
                </div>
              )} */}

              {/* {results.url && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href={results.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on App Store
                  </a>
                </div>
              )} */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Helper component for displaying data items
function DataItem({ label, value, copyable = false, onCopy }) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <span className="text-xs text-gray-500 dark:text-gray-400 block">{label}</span>
        <span className="text-sm font-medium dark:text-white">{value || "N/A"}</span>
      </div>
      {copyable && value && (
        <Button variant="ghost" size="icon" onClick={onCopy} className="h-8 w-8">
          <Copy className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
  if (!bytes) return "Unknown"
  bytes = Number.parseInt(bytes)
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return "Unknown"
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

