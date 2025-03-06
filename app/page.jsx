"use client"

import DataItem from "@/lib/DataItem"
import { formatBytes, formatDate, validateInput } from "@/lib/helpers"
import { fetchByAppIdOrBundleId, fetchByDeveloperId } from "@/lib/fetchData"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { toast } from "sonner"
import { Moon, Sun, ExternalLink, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import GHIcon from "@/components/ui/GHIcon"

export default function Home() {
  // Input state tracking
  const [appStoreUrl, setAppStoreUrl] = useState("")
  const [appstoreId, setAppStoreId] = useState("")
  const [bundleId, setBundleId] = useState("")
  const [developerId, setDeveloperId] = useState("")
  const [includeRatings, setIncludeRatings] = useState(false)

  // Track which input field is active
  const [activeInput, setActiveInput] = useState(null) // null, "developerId", "appstoreId", "bundleId"

  // Track if user came from developer apps list
  const [fromDeveloperList, setFromDeveloperList] = useState(false)

  // View state - controls which view is shown
  const [viewMode, setViewMode] = useState("none") // "none", "single", "list"

  // Results state
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [developerApps, setDeveloperApps] = useState(null)
  const [cachedDeveloperApps, setCachedDeveloperApps] = useState(null)

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeInOut",
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  }

  // Function to clear results
  const clearResults = () => {
    setResults(null)
    setAppStoreUrl("")
    setAppStoreId("")
    setBundleId("")
    setDeveloperId("")
    setIncludeRatings(false)
    setLoading(false)
    setFromDeveloperList(false)
    setViewMode("none")
    setCachedDeveloperApps(null)
    setActiveInput(null)
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

  // Search by developer ID
  const searchByDeveloperId = async () => {
    if (!validateInput("developerId", developerId)) {
      toast.error("Error Processing Input", {
        description: "Invalid Developer ID",
        duration: 3500,
      })
      return
    }
    setLoading(true)
    const respData = await fetchByDeveloperId(developerId)
    console.log("Response Data:", respData)

    if (respData && respData.data) {
      setDeveloperApps(respData.data)
      setCachedDeveloperApps(respData.data)
      setViewMode("list")
    }

    setLoading(false)
  }

  // Search by App ID
  const searchByAppId = async () => {
    if (!validateInput("appstoreId", appstoreId)) {
      toast.error("Error Processing Input", {
        description: "Invalid App ID",
        duration: 3500,
      })
      return
    }
    setLoading(true)
    const respData = await fetchByAppIdOrBundleId("appstoreId", appstoreId, false)
    console.log("Response Data:", respData)
    setResults(respData)
    setViewMode("single")
    setFromDeveloperList(false)
    setLoading(false)
  }

  // Search by Bundle ID
  const searchByBundleId = async () => {
    if (!validateInput("bundleId", bundleId)) {
      toast.error("Error Processing Input", {
        description: "Invalid Bundle ID",
        duration: 3500,
      })
      return
    }
    setLoading(true)
    const respData = await fetchByAppIdOrBundleId("bundleId", bundleId, false)
    console.log("Response Data:", respData)
    setResults(respData)
    setViewMode("single")
    setFromDeveloperList(false)
    setLoading(false)
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  // set theme in localStorage upon page load
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme")
    if (storedTheme === "dark") {
      setIsDarkMode(true)
    } else if (storedTheme === "light") {
      setIsDarkMode(false)
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDarkMode(prefersDark)
    }
  }, [])

  // handles applying classes to document and updates localStorage when state is toggled
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("theme", isDarkMode ? "dark" : "light")
  }, [isDarkMode])

  // Handle input changes and set active input
  const handleDeveloperIdChange = (e) => {
    const value = e.target.value
    setDeveloperId(value)
    if (value) {
      setActiveInput("developerId")
    } else if (activeInput === "developerId") {
      setActiveInput(null)
    }
  }

  const handleAppIdChange = (e) => {
    const value = e.target.value
    setAppStoreId(value)
    if (value) {
      setActiveInput("appstoreId")
    } else if (activeInput === "appstoreId") {
      setActiveInput(null)
    }
  }

  const handleBundleIdChange = (e) => {
    const value = e.target.value
    setBundleId(value)
    if (value) {
      setActiveInput("bundleId")
    } else if (activeInput === "bundleId") {
      setActiveInput(null)
    }
  }

  return (
    <div
      className={`flex items-center justify-center min-h-screen p-4 ${isDarkMode ? "dark bg-zinc-950" : "bg-gray-50"}`}
    >
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 relative w-full mx-auto">
        <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-6 transition-colors duration-200">
          <div className="flex justify-end mb-4 gap-2">
            <a href="https://github.com/jasonhe54/SearchBundleID" target="_blank" rel="noreferrer">
              <Button variant="outline" size="icon" aria-label="GitHub Repository">
                <GHIcon className="h-5 w-5 text-black dark:text-white" />
              </Button>
            </a>

            <Button variant="outline" size="icon" onClick={toggleDarkMode} aria-label="Toggle dark mode">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>

          <h1 className="text-2xl font-bold mb-2 text-center dark:text-white">Bundle Search</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 text-center">
            Complete a field below to search for an App Store Bundle ID, or an App ID.
          </p>

          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Enter Developer ID"
                  className="dark:bg-zinc-700 dark:text-white dark:border-gray-600 pr-10"
                  autoCapitalize="off"
                  value={developerId}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      searchByDeveloperId()
                    }
                  }}
                  onChange={handleDeveloperIdChange}
                  disabled={loading || (activeInput !== null && activeInput !== "developerId")}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={searchByDeveloperId}
                disabled={loading || !developerId}
                aria-label="Search by Developer ID"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Enter App ID"
                  className="dark:bg-zinc-700 dark:text-white dark:border-gray-600 pr-10"
                  autoCapitalize="off"
                  inputMode="numeric"
                  value={appstoreId}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      searchByAppId()
                    }
                  }}
                  onChange={handleAppIdChange}
                  disabled={loading || (activeInput !== null && activeInput !== "appstoreId")}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={searchByAppId}
                disabled={loading || !appstoreId}
                aria-label="Search by App ID"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Enter Bundle ID"
                  className="dark:bg-zinc-700 dark:text-white dark:border-gray-600 pr-10"
                  autoCapitalize="off"
                  value={bundleId}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      searchByBundleId()
                    }
                  }}
                  onChange={handleBundleIdChange}
                  disabled={loading || (activeInput !== null && activeInput !== "bundleId")}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={searchByBundleId}
                disabled={loading || !bundleId}
                aria-label="Search by Bundle ID"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === "single" && results && (
            <motion.div
              key="single-view"
              className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-6 transition-colors duration-200"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
            >
              <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold dark:text-white">Results</h2>
                <div className="flex gap-2">
                  {fromDeveloperList && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setViewMode("list")
                        setDeveloperApps(cachedDeveloperApps)
                      }}
                      className="text-gray-600 dark:text-gray-300"
                    >
                      Back to List
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearResults}
                    className="text-gray-600 dark:text-gray-300"
                  >
                    Clear
                  </Button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-start gap-4 mb-6">
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
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-4 mb-4">
                <DataItem
                  label="App Store URL"
                  value={results.url}
                  copyable
                  onCopy={() => copyToClipboard(results.url)}
                />
                <DataItem
                  label="Bundle ID"
                  value={results.appId}
                  copyable
                  onCopy={() => copyToClipboard(results.appId)}
                />
                <DataItem label="App ID" value={results.id} copyable onCopy={() => copyToClipboard(results.id)} />
                <DataItem
                  label="Developer ID"
                  value={results.developerId}
                  copyable
                  onCopy={() => copyToClipboard(results.developerId)}
                />
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
              </motion.div>

              {results.description && (
                <motion.div variants={itemVariants}>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Description</AccordionTrigger>
                      <AccordionContent className={"text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line"}>
                        <div className="pb-4">{results.description}</div>
                        <Button
                          variant="outline"
                          className={"w-full"}
                          onClick={() => {
                            copyToClipboard(results.description)
                          }}
                        >
                          Copy Description
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </motion.div>
              )}
            </motion.div>
          )}

          {viewMode === "list" && developerApps && (
            <motion.div
              key="list-view"
              className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-6 transition-colors duration-200"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
            >
              <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold dark:text-white">Developer Apps ({developerApps.length})</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDeveloperApps(null)
                    setCachedDeveloperApps(null)
                    setDeveloperId("")
                    setViewMode("none")
                    setActiveInput(null)
                  }}
                  className="text-gray-600 dark:text-gray-300"
                >
                  Clear
                </Button>
              </motion.div>

              <motion.div variants={itemVariants} className="max-h-[600px] overflow-y-auto pr-2">
                <div className="space-y-6">
                  {developerApps.map((app, index) => (
                    <motion.div
                      key={app.id}
                      className="border-b dark:border-gray-700 pb-4 last:border-0 last:pb-0"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: {
                          delay: index * 0.05,
                          duration: 0.3,
                        },
                      }}
                    >
                      <div className="flex items-start gap-4 mb-2">
                        {app.icon && (
                          <div className="flex-shrink-0">
                            <Image
                              src={app.icon || "/placeholder.svg"}
                              alt={app.title || "App icon"}
                              width={60}
                              height={60}
                              className="rounded-xl"
                            />
                          </div>
                        )}
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-semibold dark:text-white">{app.title}</h3>
                            <div className="ml-auto flex gap-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => window.open(app.url, "_blank")}
                                className="h-8 w-8"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <span className="truncate max-w-[200px]">{app.appId}</span>
                            {app.free !== undefined && (
                              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                                {app.free ? "Free" : `$${app.price}`}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setResults(app)
                                setFromDeveloperList(true)
                                setViewMode("single")
                              }}
                            >
                              View Details
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => copyToClipboard(app.appId)}>
                              Copy Bundle ID
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}