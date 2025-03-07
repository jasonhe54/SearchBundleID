"use client"

import { useCallback, memo, useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useSearch } from "@/context/SearchContext"
import { Button } from "@/components/ui/button"
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { itemVariants } from "@/lib/animations"
import DataItem from "@/lib/DataItem"
import { formatBytes, formatDate } from "@/lib/helpers"
import { toast } from "sonner"

// Memoized app item component to prevent unnecessary re-renders
const AppItem = memo(({ app, index, setResults, setFromDeveloperList, setViewMode, copyToClipboard }) => {
  return (
    <motion.div
      key={app.id}
      className="border-b dark:border-gray-700 pb-4 last:border-0 last:pb-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          delay: Math.min(index * 0.03, 0.3), // Cap the delay to prevent too much staggering
          duration: 0.3,
        },
      }}
    >
      <div className="flex items-start gap-4 mb-2">
        {app.icon && (
          <motion.div
            className="flex-shrink-0"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) + 0.1 }}
          >
            <Image
              src={app.icon || "/placeholder.svg"}
              alt={app.title || "App icon"}
              width={60}
              height={60}
              className="rounded-xl"
            />
          </motion.div>
        )}
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold dark:text-white">{app.title}</h3>
            <div className="ml-auto flex gap-0">
              <Button variant="ghost" size="icon" onClick={() => window.open(app.url, "_blank")} className="h-8 w-8">
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
  )
})

AppItem.displayName = "AppItem"

// Pagination component using shadcn/ui components
const Pagination = memo(({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-between mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="hidden sm:flex"
      >
        First
      </Button>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm text-gray-600 dark:text-gray-300 px-2">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="hidden sm:flex"
      >
        Last
      </Button>
    </div>
  )
})

Pagination.displayName = "Pagination"

const CombinedView = () => {
  const {
    viewMode,
    results,
    developerApps,
    fromDeveloperList,
    setViewMode,
    setDeveloperApps,
    cachedDeveloperApps,
    setCachedDeveloperApps,
    setDeveloperId,
    setResults,
    setFromDeveloperList,
    setActiveInput,
    isSearchVisible,
    setIsSearchVisible,
    setAppStoreId,
    setBundleId,
    setLoadingField,
    setLoading,
  } = useSearch()

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [paginatedApps, setPaginatedApps] = useState([])

  // Calculate total pages
  const totalPages = developerApps ? Math.ceil(developerApps.length / itemsPerPage) : 0

  // Update paginated apps when page changes or developer apps change
  useEffect(() => {
    if (developerApps) {
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      setPaginatedApps(developerApps.slice(startIndex, endIndex))

      // Save current page to localStorage
      try {
        localStorage.setItem("developerAppsPage", currentPage.toString())
        localStorage.setItem("developerAppsPerPage", itemsPerPage.toString())
      } catch (error) {
        console.error("Failed to save pagination state to localStorage:", error)
      }
    }
  }, [currentPage, developerApps, itemsPerPage])

  // Load pagination preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedPage = localStorage.getItem("developerAppsPage")
      const savedItemsPerPage = localStorage.getItem("developerAppsPerPage")

      if (savedPage) {
        setCurrentPage(Number.parseInt(savedPage, 10))
      }

      if (savedItemsPerPage) {
        setItemsPerPage(Number.parseInt(savedItemsPerPage, 10))
      }
    } catch (error) {
      console.error("Failed to load pagination state from localStorage:", error)
    }
  }, [])

  // Reset to page 1 when developer apps change
  useEffect(() => {
    if (developerApps) {
      setCurrentPage(1)
    }
  }, [developerApps])

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    // Smooth scroll to top of list
    const listElement = document.getElementById("developer-apps-list")
    if (listElement) {
      listElement.scrollTo({ top: 0, behavior: "smooth" })
    }

    setCurrentPage(newPage)
  }, [])

  // Handle items per page change
  const handleItemsPerPageChange = useCallback((value) => {
    const newItemsPerPage = Number.parseInt(value, 10)
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
  }, [])

  // Function to clear results
  const clearResults = useCallback(() => {
    setResults(null)
    setAppStoreId("")
    setBundleId("")
    setDeveloperId("")
    setLoading(false)
    setLoadingField(null)
    setFromDeveloperList(false)
    setViewMode("none")
    setCachedDeveloperApps(null)
    setActiveInput(null)
    setIsSearchVisible(true)
  }, [
    setResults,
    setAppStoreId,
    setBundleId,
    setDeveloperId,
    setLoading,
    setLoadingField,
    setFromDeveloperList,
    setViewMode,
    setCachedDeveloperApps,
    setActiveInput,
    setIsSearchVisible,
  ])

  // Function to return to search view
  const returnToSearch = useCallback(() => {
    clearResults()
    setIsSearchVisible(true)
  }, [clearResults, setIsSearchVisible])

  // Function to copy text to clipboard
  const copyToClipboard = useCallback((text) => {
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
  }, [])

  return (
    <AnimatePresence mode="wait">
      {viewMode === "single" && results && (
        <motion.div
          key="single-view"
          className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-6 transition-colors duration-200"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            delay: isSearchVisible ? 0.2 : 0,
          }}
          layout
        >
          <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold dark:text-white">Results</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={returnToSearch}
                className="text-gray-600 dark:text-gray-300 transition-all duration-300 hover:scale-105"
              >
                Back to Search
              </Button>
              {fromDeveloperList && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="text-gray-600 dark:text-gray-300"
                >
                  Back to List
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={clearResults} className="text-gray-600 dark:text-gray-300">
                Clear
              </Button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-start gap-4 mb-6">
            {results.icon && (
              <motion.div
                className="flex-shrink-0"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={results.icon || "/placeholder.svg"}
                  alt={results.title || "App icon"}
                  width={80}
                  height={80}
                  className="rounded-xl"
                />
              </motion.div>
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
            <DataItem label="App Store URL" value={results.url} copyable onCopy={() => copyToClipboard(results.url)} />
            <DataItem label="Bundle ID" value={results.appId} copyable onCopy={() => copyToClipboard(results.appId)} />
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
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            delay: isSearchVisible ? 0.2 : 0,
          }}
          layout
        >
          <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold dark:text-white">Developer Apps ({developerApps.length})</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={returnToSearch}
                className="text-gray-600 dark:text-gray-300 transition-all duration-300 hover:scale-105"
              >
                Back to Search
              </Button>
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
            </div>
          </motion.div>

          {/* Items per page selector using shadcn/ui Select */}
          <div className="flex justify-end mb-4">
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[180px] h-10 px-4 py-2 bg-background text-sm font-medium border border-input rounded-md ring-offset-background hover:bg-accent hover:text-accent-foreground">
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <motion.div id="developer-apps-list" variants={itemVariants} className="max-h-[500px] overflow-y-auto pr-2">
            <div className="space-y-6">
              {paginatedApps.map((app, index) => (
                <AppItem
                  key={app.id}
                  app={app}
                  index={index}
                  setResults={setResults}
                  setFromDeveloperList={setFromDeveloperList}
                  setViewMode={setViewMode}
                  copyToClipboard={copyToClipboard}
                />
              ))}
            </div>
          </motion.div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CombinedView