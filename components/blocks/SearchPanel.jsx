"use client"
import { motion } from "framer-motion"
import { useSearch } from "@/context/SearchContext"
import { fetchByAppIdOrBundleId, fetchByDeveloperId } from "@/lib/fetchData"
import { validateInput } from "@/lib/helpers"
import { toast } from "sonner"
import { useCallback, useEffect } from "react"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import GHIcon from "@/components/ui/GHIcon"

// Icons
import { Moon, Sun, ArrowRight, Loader2 } from "lucide-react"

// Animation variants
import { itemVariants, inputVariants } from "@/lib/animations"

// Subcomponents for cleaner organization
import SearchHistory from "@/components/blocks/SearchHistory"

// Cache expiration time (10 minutes)
const CACHE_EXPIRATION = 10 * 60 * 1000

const SearchPanel = () => {
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
        setIsSearchVisible,
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

    // Check localStorage for cached developer apps
    const checkCachedDeveloperApps = useCallback((developerId) => {
        try {
            const cachedData = localStorage.getItem(`developerApps_${developerId}`)
            if (cachedData) {
                const { data, timestamp } = JSON.parse(cachedData)
                // Check if cache is still valid
                if (Date.now() - timestamp < CACHE_EXPIRATION) {
                    return data
                } else {
                    // Cache expired, remove it
                    localStorage.removeItem(`developerApps_${developerId}`)
                }
            }
        } catch (error) {
            console.error("Error reading from localStorage:", error)
        }
        return null
    }, [])

    // Save developer apps to localStorage
    const cacheDeveloperApps = useCallback((developerId, data) => {
        try {
            const cacheData = {
                data,
                timestamp: Date.now(),
            }
            localStorage.setItem(`developerApps_${developerId}`, JSON.stringify(cacheData))
        } catch (error) {
            console.error("Error saving to localStorage:", error)
        }
    }, [])

    // Search by developer ID with caching
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
                // Check localStorage cache first
                const cachedData = checkCachedDeveloperApps(query)

                if (cachedData) {
                    console.log("Using cached developer apps data")
                    setDeveloperApps(cachedData)
                    setCachedDeveloperApps(cachedData)
                    setViewMode("list")
                    let historyJSONFormat = {
                        developerName: cachedData[0].developer,
                        developerId: query
                    }
                    saveToHistory("developerId", query, historyJSONFormat)

                    // Add a slight delay for smoother transition
                    setTimeout(() => {
                        console.log("Hiding search - cached developer data")
                        setIsSearchVisible(false)
                    }, 100)
                } else {
                    // Fetch from API if not in cache
                    const respData = await fetchByDeveloperId(query)
                    console.log("Response Data:", respData)

                    if (respData && respData.data) {
                        setDeveloperApps(respData.data)
                        setCachedDeveloperApps(respData.data)
                        setViewMode("list")
                        saveToHistory("developerId", query, {
                            developerName: respData.developerName,
                            developerId: query
                        })

                        // Cache the data in localStorage
                        cacheDeveloperApps(query, respData.data)

                        // Add a slight delay for smoother transition
                        setTimeout(() => {
                            setIsSearchVisible(false)
                        }, 100)
                    }
                }
            } catch {
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
            cacheDeveloperApps,
            checkCachedDeveloperApps,
            clearSearchInputs,
            developerId,
            saveToHistory,
            setCachedDeveloperApps,
            setDeveloperApps,
            setIsSearchVisible,
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
                console.log("Response Data:", respData)
                setResults(respData)
                setViewMode("single")
                setFromDeveloperList(false)

                if (respData) { // ensures the API call succeeds
                    console.log("Saving to hist and hiding search")
                    saveToHistory("appstoreId", query, respData)
                    // Add a slight delay for smoother transition
                    setTimeout(() => {
                        setIsSearchVisible(false)
                    }, 100)
                }
            } catch {
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
            setIsSearchVisible,
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
                console.log("Response Data for Bundle ID Search:", respData)
                setResults(respData)
                setViewMode("single")
                setFromDeveloperList(false)

                if (respData) {
                    console.log("Saving to hist and hiding search")
                    saveToHistory("bundleId", query, respData)
                    // Add a slight delay for smoother transition
                    setTimeout(() => {
                        setIsSearchVisible(false)
                    }, 100)
                }
            } catch {
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
            setIsSearchVisible,
            setLoading,
            setLoadingField,
            setViewMode,
        ],
    )

    // Clean up old cached data on component mount
    useEffect(() => {
        try {
            // Get all localStorage keys
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key && key.startsWith("developerApps_")) {
                    try {
                        const cachedData = JSON.parse(localStorage.getItem(key))
                        // Remove if expired
                        if (Date.now() - cachedData.timestamp > CACHE_EXPIRATION) {
                            localStorage.removeItem(key)
                        }
                    } catch (e) {
                        // Invalid JSON, remove the item
                        localStorage.removeItem(key)
                    }
                }
            }
        } catch (error) {
            console.error("Error cleaning localStorage cache:", error)
        }
    }, [])

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

export default SearchPanel