"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

// Components
import SearchPanel from "@/components/blocks/SearchPanel"
import CombinedView from "@/components/blocks/CombinedView"

// Helpers
import { fetchByAppIdOrBundleId, fetchByDeveloperId } from "@/lib/fetchData"
import { validateInput } from "@/lib/helpers"
import { toast } from "sonner"

// Animation variants
import { containerVariants } from "@/lib/animations"

export default function Home() {
  // Input state tracking
  const [appstoreId, setAppStoreId] = useState("")
  const [bundleId, setBundleId] = useState("")
  const [developerId, setDeveloperId] = useState("")

  // Track which input field is active
  const [activeInput, setActiveInput] = useState(null) // null, "developerId", "appstoreId", "bundleId"

  // Track if user came from developer apps list
  const [fromDeveloperList, setFromDeveloperList] = useState(false)

  // View state - controls which view is shown
  const [viewMode, setViewMode] = useState("none") // "none", "single", "list"

  // Results state
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingField, setLoadingField] = useState(null) // Track which field is loading
  const [developerApps, setDeveloperApps] = useState(null)
  const [cachedDeveloperApps, setCachedDeveloperApps] = useState(null)

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Search history state
  const [searchHistory, setSearchHistory] = useState([])

  // Function to clear results
  const clearResults = () => {
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

  // Load search history from localStorage on component mount
  useEffect(() => {
    const storedHistory = localStorage.getItem('searchHistory')
    if (storedHistory) {
      try {
        setSearchHistory(JSON.parse(storedHistory))
      } catch (error) {
        console.error('Failed to parse search history:', error)
        localStorage.removeItem('searchHistory')
      }
    }
  }, [])

  const saveToHistory = (searchType, query, appInfo = null) => {
    const timestamp = new Date().toISOString()
    const newSearch = {
      id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
      type: searchType,
      query,
      timestamp,
      appInfo: appInfo ? {
        title: appInfo.title,
        bundleId: appInfo.appId,
        appId: appInfo.id,
      } : null
    }
    
    const updatedHistory = [newSearch, ...searchHistory.slice(0, 19)]
    setSearchHistory(updatedHistory)
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory))
  }

  // Clear search history
  const clearHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('searchHistory')
    toast.success("Search history cleared")
  }

  // Remove single history item
  const removeHistoryItem = (id) => {
    const updatedHistory = searchHistory.filter(item => item.id !== id)
    setSearchHistory(updatedHistory)
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory))
  }

  // Add a helper function to clear search inputs except for the active one
  const clearSearchInputs = (activeType = null, preserveResults = false) => {
    // Only clear results if not preserving them
    if (!preserveResults) {
      setResults(null);
    }
    
    setFromDeveloperList(false);
    
    // Clear inputs except for the active one
    if (activeType !== "developerId") setDeveloperId("");
    if (activeType !== "appstoreId") setAppStoreId("");
    if (activeType !== "bundleId") setBundleId("");
    
    // Always set the active input
    setActiveInput(activeType);
    setLoadingField(activeType);
  }

  // Search by developer ID
  const searchByDeveloperId = async (searchHistoryQuery = null) => {
    let query = searchHistoryQuery || developerId

    console.log("Searching by Developer ID:", query)
    if (!validateInput("developerId", query)) {
      toast.error("Error Processing Input", {
        description: "Invalid Developer ID, given: " + query,
        duration: 3500,
      })
      return
    }
    
    clearSearchInputs("developerId");
    setLoading(true)
    setLoadingField("developerId")

    try {
      const respData = await fetchByDeveloperId(query)
      console.log("Response Data:", respData)

      if (respData && respData.data) {
        setDeveloperApps(respData.data)
        setCachedDeveloperApps(respData.data)
        setViewMode("list")
        saveToHistory("developerId", query)
      }
    } finally {
      setLoading(false)
      setLoadingField(null)
    }
  }

  // Search by App ID
  const searchByAppId = async (searchHistoryQuery = null) => {
    let query = searchHistoryQuery || appstoreId

    if (!validateInput("appstoreId", query)) {
      toast.error("Error Processing Input", {
        description: "Invalid App ID, given: " + query,
        duration: 3500,
      })
      return
    }
    
    clearSearchInputs("appstoreId");
    setLoading(true)
    setLoadingField("appstoreId")

    try {
      const respData = await fetchByAppIdOrBundleId("appstoreId", query, false)
      console.log("Response Data:", respData)
      setResults(respData)
      setViewMode("single")
      setFromDeveloperList(false)
      saveToHistory("appstoreId", query, respData)
    } finally {
      setLoading(false)
      setLoadingField(null)
    }
  }

  // Search by Bundle ID
  const searchByBundleId = async (searchHistoryQuery = null) => {
    let query = searchHistoryQuery || bundleId

    if (!validateInput("bundleId", query)) {
      toast.error("Error Processing Input", {
        description: "Invalid Bundle ID, given: " + query,
        duration: 3500,
      })
      return
    }
    
    clearSearchInputs("bundleId");
    setLoading(true)
    setLoadingField("bundleId")

    try {
      const respData = await fetchByAppIdOrBundleId("bundleId", query, false)
      console.log("Response Data:", respData)
      setResults(respData)
      setViewMode("single")
      setFromDeveloperList(false)
      saveToHistory("bundleId", query, respData)
    } finally {
      setLoading(false)
      setLoadingField(null)
    }
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
        <motion.div
          className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-6 transition-colors duration-200"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <SearchPanel
            appstoreId={appstoreId}
            bundleId={bundleId}
            developerId={developerId}
            activeInput={activeInput}
            loading={loading}
            loadingField={loadingField}
            isDarkMode={isDarkMode}
            searchHistory={searchHistory}
            handleDeveloperIdChange={handleDeveloperIdChange}
            handleAppIdChange={handleAppIdChange}
            handleBundleIdChange={handleBundleIdChange}
            searchByDeveloperId={searchByDeveloperId}
            searchByAppId={searchByAppId}
            searchByBundleId={searchByBundleId}
            toggleDarkMode={toggleDarkMode}
            clearHistory={clearHistory}
            removeHistoryItem={removeHistoryItem}
          />
        </motion.div>

        <CombinedView
          viewMode={viewMode}
          results={results}
          developerApps={developerApps}
          fromDeveloperList={fromDeveloperList}
          setViewMode={setViewMode}
          setDeveloperApps={setDeveloperApps}
          cachedDeveloperApps={cachedDeveloperApps}
          setCachedDeveloperApps={setCachedDeveloperApps}
          setDeveloperId={setDeveloperId}
          setResults={setResults}
          setFromDeveloperList={setFromDeveloperList}
          setActiveInput={setActiveInput}
          clearResults={clearResults}
          copyToClipboard={copyToClipboard}
        />
      </div>
    </div>
  )
}