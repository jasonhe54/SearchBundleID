import React from "react"
import { motion } from "framer-motion"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import GHIcon from "@/components/ui/GHIcon"

// Icons
import { Moon, Sun, ArrowRight, Loader2, Clock, X } from "lucide-react"

// Animation variants
import { itemVariants, inputVariants } from "@/lib/animations"

// Subcomponents for cleaner organization
import SearchHistory from "@/components/blocks/SearchHistory"

const SearchPanel = ({
  appstoreId,
  bundleId,
  developerId,
  activeInput,
  loading,
  loadingField,
  isDarkMode,
  searchHistory,
  handleDeveloperIdChange,
  handleAppIdChange,
  handleBundleIdChange,
  searchByDeveloperId,
  searchByAppId,
  searchByBundleId,
  toggleDarkMode,
  clearHistory,
  removeHistoryItem,
}) => {
  return (
    <>
      <motion.div className="flex justify-end mb-4 gap-2" variants={itemVariants}>
        <a href="https://github.com/jasonhe54/SearchBundleID" target="_blank" rel="noreferrer">
          <Button variant="outline" size="icon" aria-label="GitHub Repository">
            <GHIcon className="h-5 w-5 text-black dark:text-white" />
          </Button>
        </a>

        <Button variant="outline" size="icon" onClick={toggleDarkMode} aria-label="Toggle dark mode">
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </motion.div>

      <motion.h1 className="text-2xl font-bold mb-2 text-center dark:text-white" variants={itemVariants}>
        Bundle Search
      </motion.h1>
      <motion.p className="text-sm text-gray-600 dark:text-gray-300 mb-6 text-center" variants={itemVariants}>
        Search for App Store apps by Bundle ID, App ID, or get a list of apps by Developer ID.
      </motion.p>

      <motion.div className="space-y-4" variants={itemVariants}>
        <motion.div className="flex gap-2" variants={inputVariants}>
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
            onClick={() => {
                searchByDeveloperId()  
            }}
            disabled={loading || !developerId}
            aria-label="Search by Developer ID"
          >
            {loadingField === "developerId" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </Button>
        </motion.div>

        <motion.div className="flex gap-2" variants={inputVariants}>
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
            onClick={() => {
                searchByAppId()
            }}
            disabled={loading || !appstoreId}
            aria-label="Search by App ID"
          >
            {loadingField === "appstoreId" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </Button>
        </motion.div>

        <motion.div className="flex gap-2" variants={inputVariants}>
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
            onClick={() => {
                searchByBundleId()
            }}
            disabled={loading || !bundleId}
            aria-label="Search by Bundle ID"
          >
            {loadingField === "bundleId" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </Button>
        </motion.div>
      </motion.div>
      
      <SearchHistory 
        searchHistory={searchHistory}
        clearHistory={clearHistory}
        removeHistoryItem={removeHistoryItem}
      />
    </>
  )
}

export default SearchPanel