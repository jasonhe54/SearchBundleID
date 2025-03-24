"use client"

import { useState, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { itemVariants } from "@/lib/animations"
import AppItem from "@/components/search/AppItem"
import Pagination from "@/components/search/Pagination"

export default function DeveloperAppsList({
  developerApps,
  returnToSearch,
  clearResults,
  setResults,
  setFromDeveloperList,
  setViewMode,
  copyToClipboard,
}) {
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

  return (
    <>
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
          <Button variant="outline" size="sm" onClick={clearResults} className="text-gray-600 dark:text-gray-300">
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
    </>
  )
}