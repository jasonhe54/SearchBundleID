"use client"

import { motion } from "framer-motion"
import { useSearch } from "@/context/SearchContext"
import SingleAppView from "@/components/search/SingleAppView"
import DeveloperAppsList from "@/components/search/DeveloperAppList"
import { Search } from "lucide-react"
import { useCallback } from "react"
import { toast } from "sonner"

export default function MainContent() {
  const {
    results,
    developerApps,
    fromDeveloperList,
    setResults,
    setDeveloperApps,
  } = useSearch()

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

  const clearResults = useCallback(() => {
    setResults(null)
    setDeveloperApps(null)
  }, [setResults, setDeveloperApps])

  const returnToSearch = useCallback(() => {
    clearResults()
  }, [clearResults])

  // Empty state
  if (!results && !developerApps) {
    return (
      <div className="flex items-center justify-center min-h-[300px] md:min-h-[calc(100vh-3.5rem)] p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 max-w-sm w-full"
        >
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-primary/10">
              <Search className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Start Searching</h2>
            <p className="text-sm text-muted-foreground">
              Use the search fields above to find apps by Developer ID, App ID, or Bundle ID.
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  // Show single app view
  if (results && !developerApps) {
    return (
      <div className="p-4 md:p-6">
        <SingleAppView
          results={results}
          fromDeveloperList={fromDeveloperList}
          returnToSearch={returnToSearch}
          clearResults={clearResults}
          setViewMode={() => {}}
          copyToClipboard={copyToClipboard}
        />
      </div>
    )
  }

  // Show developer apps list
  if (developerApps && !results) {
    return (
      <div className="p-4 md:p-6">
        <DeveloperAppsList
          developerApps={developerApps}
          returnToSearch={returnToSearch}
          clearResults={clearResults}
          setResults={setResults}
          setFromDeveloperList={() => {}}
          setViewMode={() => {}}
          copyToClipboard={copyToClipboard}
          setDeveloperApps={setDeveloperApps}
        />
      </div>
    )
  }

  return null
}
