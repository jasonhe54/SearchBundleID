"use client"

import { motion } from "framer-motion"
import { useSearch } from "@/context/SearchContext"
import { fetchByAppIdOrBundleId, fetchByDeveloperId } from "@/lib/fetchData"
import { validateInput } from "@/lib/helpers"
import { toast } from "sonner"
import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import GHIcon from "@/components/ui/GHIcon"
import { Moon, Sun, ArrowRight, Loader2 } from "lucide-react"
import { itemVariants, inputVariants } from "@/lib/animations"
import SearchHistory from "@/components/search/SearchHistory"

export default function SearchPanel() {
  const {
    appstoreId,
    setAppStoreId,
    bundleId,
    setBundleId,
    developerId,
    setDeveloperId,
    activeInput,
    setActiveInput,
    loading,
    setLoading,
    loadingField,
    setLoadingField,
    isDarkMode,
    setIsDarkMode,
    searchHistory,
    setSearchHistory,
    setViewMode,
    setResults,
    setDeveloperApps,
    setCachedDeveloperApps,
    setFromDeveloperList,
    saveToHistory,
    clearSearchInputs,
  } = useSearch()

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(!isDarkMode)
  }, [isDarkMode, setIsDarkMode])

  // Clear search history
  const clearHistory = useCallback(() => {
    setSearchHistory([])
    localStorage.removeItem("searchHistory")
    toast.success("Search history cleared")
  }, [setSearchHistory])

  // Remove single history item
  const removeHistoryItem = useCallback(
    (id) => {
      const updatedHistory = searchHistory.filter((item) => item.id !== id)
      setSearchHistory(updatedHistory)
      localStorage.setItem("searchHistory", JSON.stringify(updatedHistory))
    },
    [searchHistory, setSearchHistory],
  )

  // Handle input changes and set active input
  const handleDeveloperIdChange = useCallback(
    (e) => {
      const value = e.target.value
      setDeveloperId(value)
      if (value) {
        setActiveInput("developerId")
      } else if (activeInput === "developerId") {
        setActiveInput(null)
      }
    },
    [activeInput, setActiveInput, setDeveloperId],
  )

  const handleAppIdChange = useCallback(
    (e) => {
      const value = e.target.value
      setAppStoreId(value)
      if (value) {
        setActiveInput("appstoreId")
      } else if (activeInput === "appstoreId") {
        setActiveInput(null)
      }
    },
    [activeInput, setActiveInput, setAppStoreId],
  )

  const handleBundleIdChange = useCallback(
    (e) => {
      const value = e.target.value
      setBundleId(value)
      if (value) {
        setActiveInput("bundleId")
      } else if (activeInput === "bundleId") {
        setActiveInput(null)
      }
    },
    [activeInput, setActiveInput, setBundleId],
  )

  // Search by developer ID
  const searchByDeveloperId = useCallback(
    async (searchHistoryQuery = null) => {
      const query = searchHistoryQuery || developerId

      console.log("Searching by Developer ID:", query)
      if (!validateInput("developerId", query)) {
        toast.error("Error Processing Input", {
          description: "Error Validating Developer ID, given: " + query,
          duration: 3500,
        })
        return
      }

      clearSearchInputs("developerId")
      setLoading(true)
      setLoadingField("developerId")

      try {
        // Client-side fetch implementation
        const respData = await fetchByDeveloperId(query)
        console.log("Developer search response:", respData)
        
        if (respData && respData.data) {
          setDeveloperApps(respData.data)
          setCachedDeveloperApps(respData.data)
          setViewMode("list")
          saveToHistory("developerId", query, {
            developerName: respData.developerName,
            developerId: query,
          })
        } else {
          throw new Error("Failed to fetch developer apps")
        }
      } catch (error) {
        toast.error("Error Processing Input", {
          description: "Invalid Developer ID, given: " + query,
          duration: 3500,
        })
        return
      } finally {
        setLoading(false)
        setLoadingField(null)
      }
    },
    [
      clearSearchInputs,
      developerId,
      saveToHistory,
      setCachedDeveloperApps,
      setDeveloperApps,
      setLoading,
      setLoadingField,
      setViewMode,
    ],
  )

  // Search by App ID
  const searchByAppId = useCallback(
    async (searchHistoryQuery = null) => {
      const query = searchHistoryQuery || appstoreId

      if (!validateInput("appstoreId", query)) {
        toast.error("Error Processing Input", {
          description: "Invalid App ID, given: " + query,
          duration: 3500,
        })
        return
      }

      clearSearchInputs("appstoreId")
      setLoading(true)
      setLoadingField("appstoreId")

      try {
        // Client-side fetch implementation
        const respData = await fetchByAppIdOrBundleId("appstoreId", query, false)
        console.log("App ID search response:", respData)
        
        if (respData) {
          // The response is already formatted for SingleAppView
          setResults(respData)
          setViewMode("single")
          setFromDeveloperList(false)
          saveToHistory("appstoreId", query, respData)
        } else {
          throw new Error("Failed to fetch app data")
        }
      } catch (error) {
        toast.error("Error Processing Input", {
          description: "Invalid App ID, given: " + query,
          duration: 3500,
        })
        return
      } finally {
        setLoading(false)
        setLoadingField(null)
      }
    },
    [
      appstoreId,
      clearSearchInputs,
      saveToHistory,
      setFromDeveloperList,
      setResults,
      setLoading,
      setLoadingField,
      setViewMode,
    ],
  )

  // Search by Bundle ID
  const searchByBundleId = useCallback(
    async (searchHistoryQuery = null) => {
      const query = searchHistoryQuery || bundleId

      if (!validateInput("bundleId", query)) {
        toast.error("Error Processing Input", {
          description: "Invalid Bundle ID, given: " + query,
          duration: 3500,
        })
        return
      }

      clearSearchInputs("bundleId")
      setLoading(true)
      setLoadingField("bundleId")

      try {
        // Client-side fetch implementation
        const respData = await fetchByAppIdOrBundleId("bundleId", query, false)
        console.log("Bundle ID search response:", respData)
        
        if (respData) {
          // The response is already formatted for SingleAppView
          setResults(respData)
          setViewMode("single")
          setFromDeveloperList(false)
          saveToHistory("bundleId", query, respData)
        } else {
          throw new Error("Failed to fetch app data")
        }
      } catch (error) {
        toast.error("Error Processing Input", {
          description: "Invalid Bundle ID, given: " + query,
          duration: 3500,
        })
        return
      } finally {
        setLoading(false)
        setLoadingField(null)
      }
    },
    [
      bundleId,
      clearSearchInputs,
      saveToHistory,
      setFromDeveloperList,
      setResults,
      setLoading,
      setLoadingField,
      setViewMode,
    ],
  )

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

      <SearchHistory searchHistory={searchHistory} clearHistory={clearHistory} removeHistoryItem={removeHistoryItem} />
    </>
  )
}