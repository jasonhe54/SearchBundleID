"use client"

import { motion } from "framer-motion"
import { useSearch } from "@/context/SearchContext"
import { fetchByAppIdOrBundleId, fetchByDeveloperId } from "@/lib/fetchData"
import { validateInput } from "@/lib/helpers"
import { toast } from "sonner"
import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Building2, Package, Hash } from "lucide-react"
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
        const respData = await fetchByAppIdOrBundleId("appstoreId", query, false)
        console.log("App ID search response:", respData)
        
        if (respData) {
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
        const respData = await fetchByAppIdOrBundleId("bundleId", query, false)
        console.log("Bundle ID search response:", respData)
        
        if (respData) {
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
    <div className="space-y-6">
      {/* Hero Section */}
      <motion.div
        className="text-center space-y-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          BundleSearch
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Search for App Store apps by Bundle ID, App ID, or discover all apps by Developer ID
        </p>
      </motion.div>

      {/* Search Cards Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Developer ID Card */}
        <motion.div variants={itemVariants}>
          <Card className="h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Developer ID</CardTitle>
              </div>
              <CardDescription>
                Find all apps published by a developer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="e.g., 284882215"
                  className="flex-1"
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
                <Button
                  onClick={() => searchByDeveloperId()}
                  disabled={loading || !developerId}
                  size="icon"
                  className="shrink-0"
                >
                  {loadingField === "developerId" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* App ID Card */}
        <motion.div variants={itemVariants}>
          <Card className="h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">App ID</CardTitle>
              </div>
              <CardDescription>
                Search by App Store numeric ID
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="e.g., 310633997"
                  className="flex-1"
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
                <Button
                  onClick={() => searchByAppId()}
                  disabled={loading || !appstoreId}
                  size="icon"
                  className="shrink-0"
                >
                  {loadingField === "appstoreId" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bundle ID Card */}
        <motion.div variants={itemVariants}>
          <Card className="h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Hash className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Bundle ID</CardTitle>
              </div>
              <CardDescription>
                Search by app bundle identifier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="e.g., com.apple.mobilemail"
                  className="flex-1"
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
                <Button
                  onClick={() => searchByBundleId()}
                  disabled={loading || !bundleId}
                  size="icon"
                  className="shrink-0"
                >
                  {loadingField === "bundleId" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search History */}
      <motion.div variants={itemVariants}>
        <SearchHistory
          searchHistory={searchHistory}
          clearHistory={clearHistory}
          removeHistoryItem={removeHistoryItem}
          onHistoryItemClick={(item) => {
            if (item.type === "developerId") {
              searchByDeveloperId(item.query)
            } else if (item.type === "appstoreId") {
              searchByAppId(item.query)
            } else if (item.type === "bundleId") {
              searchByBundleId(item.query)
            }
          }}
        />
      </motion.div>
    </div>
  )
}
