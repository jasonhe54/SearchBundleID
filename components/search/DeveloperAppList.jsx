"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
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
  // Allow user to choose items per page
  const [itemsPerPage, setItemsPerPage] = useState(20)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [paginatedApps, setPaginatedApps] = useState([])
  
  // Memoize processed apps to avoid recalculation on every render
  const processedDevApps = useMemo(() => {
    if (!Array.isArray(developerApps)) return [];
    
    // Process all apps without limiting to 50
    return developerApps.map((app, index) => {
      // Only ensure we have an ID for React keys
      return {
        ...app,
        id: app.id || app.appId?.toString() || `app-${index}`
      };
    });
  }, [developerApps]);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(processedDevApps.length / itemsPerPage));

  // Update paginated apps when page changes or developer apps change
  useEffect(() => {
    if (processedDevApps.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setPaginatedApps(processedDevApps.slice(startIndex, endIndex));
      
      // Save current page and items per page to localStorage
      try {
        localStorage.setItem("developerAppsPage", currentPage.toString());
        localStorage.setItem("developerAppsPerPage", itemsPerPage.toString());
      } catch (error) {
        console.error("Failed to save pagination state to localStorage:", error);
      }
    } else {
      setPaginatedApps([]);
    }
  }, [currentPage, processedDevApps, itemsPerPage]);

  // Load pagination preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedPage = localStorage.getItem("developerAppsPage");
      const savedItemsPerPage = localStorage.getItem("developerAppsPerPage");
      
      if (savedPage) {
        const parsedPage = Number.parseInt(savedPage, 10);
        if (!isNaN(parsedPage) && parsedPage > 0) {
          setCurrentPage(parsedPage);
        }
      }
      
      if (savedItemsPerPage) {
        const parsedItems = Number.parseInt(savedItemsPerPage, 10);
        if (!isNaN(parsedItems) && parsedItems > 0) {
          setItemsPerPage(parsedItems);
        }
      }
    } catch (error) {
      console.error("Failed to load pagination state from localStorage:", error);
    }
  }, []);

  // Reset to page 1 when developer apps change
  useEffect(() => {
    setCurrentPage(1);
  }, [developerApps]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    // Smooth scroll to top of list
    const listElement = document.getElementById("developer-apps-list");
    if (listElement) {
      listElement.scrollTo({ top: 0, behavior: "smooth" });
    }
    setCurrentPage(newPage);
  }, []);

  // Handle items per page change using simple buttons to avoid Select component issues
  const handleItemsPerPageChange = useCallback((newValue) => {
    setItemsPerPage(newValue);
    setCurrentPage(1); // Reset to first page when changing items per page
  }, []);

  // Display empty state if no apps
  if (!processedDevApps || processedDevApps.length === 0) {
    return (
      <>
        <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold dark:text-white">Developer Apps (0)</h2>
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
        <motion.div variants={itemVariants} className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No apps found for this developer.</p>
        </motion.div>
      </>
    )
  }

  return (
    <>
      <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold dark:text-white">Developer Apps ({processedDevApps.length})</h2>
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

      {/* Simple button-based items per page selector */}
      <div className="flex justify-end mb-4 gap-2">
        <span className="text-sm text-gray-500 flex items-center mr-2">Items per page:</span>
        {[10, 20, 50, 100].map(value => (
          <Button
            key={value}
            variant={itemsPerPage === value ? "default" : "outline"}
            size="sm"
            onClick={() => handleItemsPerPageChange(value)}
            className="h-8 px-3 text-xs"
          >
            {value}
          </Button>
        ))}
      </div>

      <motion.div id="developer-apps-list" variants={itemVariants} className="max-h-[500px] overflow-y-auto pr-2">
        <div className="space-y-6">
          {paginatedApps.map((app, index) => (
            <AppItem
              key={app.id || `app-${index}`}
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