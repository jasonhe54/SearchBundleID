"use client"

import DataItem from "@/lib/DataItem"
import { formatBytes, formatDate } from "@/lib/helpers"

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
import GHIcon from "@/components/ui/GHIcon"

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
      toast.error("Please fill in either App ID or Bundle ID.");
      return;
    }

    setLoading(true);

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
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            throw new Error(errorData.error || "Unknown error occurred");
          });
        }
        return response.json();
      })
      .then((respData) => {
        console.log("Response Data:", respData.data);
        setResults(respData.data);
        setAppStoreUrl(respData.data?.url || "");
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
        toast.error("An error occurred while fetching data. Please try again later.", {
          description: error.message,
          duration: 3500,
        });
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
        toast.success("Copied to clipboard!", {
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

  // set theme in localStorage upon page load
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      setIsDarkMode(true);
    } else if (storedTheme === "light") {
      setIsDarkMode(false);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkMode(prefersDark);
    }
  }, []);
  
  // handles applying classes to document and updates localStorage when state is toggled
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  return (
    <div
      className={`flex items-center justify-center min-h-screen p-4 ${isDarkMode ? "dark bg-zinc-950" : "bg-gray-50"}`}
    >
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 relative w-full max-w-4xl mx-auto">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-6 transition-colors duration-200">
          <div className="flex justify-end mb-4 gap-2">
            <a
              href="https://github.com/jasonhe54/SearchBundleID"
              target="_blank"
            >
              <Button variant="outline" size="icon" aria-label="GitHub Repository">
                <GHIcon className="h-5 w-5 text-black dark:text-white" />
              </Button>
            </a>

            <Button variant="outline" size="icon" onClick={toggleDarkMode} aria-label="Toggle dark mode">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>

          <h1 className="text-2xl font-bold mb-2 text-center dark:text-white">Search BundleID</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 text-center">
            Complete a field below to search for an App Store Bundle ID, or an App ID.
          </p>

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter App ID"
              className="dark:bg-zinc-700 dark:text-white dark:border-gray-600"
              autoCapitalize="off"
              value={appstoreId}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleSearch()
                }
              }}
              onChange={(e) => setAppStoreId(e.target.value)}
            />

            <Input
              type="text"
              placeholder="Enter Bundle ID"
              className="dark:bg-zinc-700 dark:text-white dark:border-gray-600"
              autoCapitalize="off"
              value={bundleId}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleSearch()
                }
              }}
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
        </div>

        <AnimatePresence>
          {results && (
            <motion.div
              className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-6 transition-colors duration-200"
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
                      <Button variant="outline" className={"w-full"} onClick={() => {
                        copyToClipboard(results.description)
                      }}>Copy Description</Button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
