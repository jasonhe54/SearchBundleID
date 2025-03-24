"use client"

import { useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSearch } from "@/context/SearchContext"
import { toast } from "sonner"

// Import our component views
import SearchPanel from "@/components/search/SearchPanel"
import SingleAppView from "@/components/search/SingleAppView"
import DeveloperAppsList from "@/components/search/DeveloperAppList"

export default function UnifiedSearchView() {
  const {
    viewMode,
    setViewMode,
    results,
    setResults,
    developerApps,
    fromDeveloperList,
    setFromDeveloperList,
    setAppStoreId,
    setBundleId,
    setDeveloperId,
    setLoading,
    setLoadingField,
    setCachedDeveloperApps,
    setActiveInput,
  } = useSearch()

  // Function to clear results
  const clearResults = useCallback(() => {
    setResults(null)
    setAppStoreId("")
    setBundleId("")
    setDeveloperId("")
    setLoading(false)
    setLoadingField(null)
    setFromDeveloperList(false)
    setViewMode("search")
    setCachedDeveloperApps(null)
    setActiveInput(null)
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
  ])

  // Function to return to search view
  const returnToSearch = useCallback(() => {
    clearResults()
    setViewMode("search")
  }, [clearResults, setViewMode])

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
    <motion.div
      className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-6 transition-colors duration-200"
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      layout
    >
      <AnimatePresence mode="wait">
        {viewMode === "search" || viewMode === "none" ? (
          <motion.div
            key="search-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <SearchPanel />
          </motion.div>
        ) : viewMode === "single" && results ? (
          <motion.div
            key="single-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <SingleAppView
              results={results}
              fromDeveloperList={fromDeveloperList}
              returnToSearch={returnToSearch}
              clearResults={clearResults}
              setViewMode={setViewMode}
              copyToClipboard={copyToClipboard}
            />
          </motion.div>
        ) : viewMode === "list" && developerApps ? (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <DeveloperAppsList
              developerApps={developerApps}
              returnToSearch={returnToSearch}
              clearResults={clearResults}
              setResults={setResults}
              setFromDeveloperList={setFromDeveloperList}
              setViewMode={setViewMode}
              copyToClipboard={copyToClipboard}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}