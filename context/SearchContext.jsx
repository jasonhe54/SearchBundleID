"use client"

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"

const SearchContext = createContext(null)

// Cache expiration time (30 minutes)
const CACHE_EXPIRATION = 30 * 60 * 1000

export function SearchProvider({ children }) {
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

    // Search visibility state
    const [isSearchVisible, setIsSearchVisible] = useState(true)

    // Load search history from localStorage on component mount
    useEffect(() => {
        const storedHistory = localStorage.getItem("searchHistory")
        if (storedHistory) {
            try {
                setSearchHistory(JSON.parse(storedHistory))
            } catch (error) {
                console.error("Failed to parse search history:", error)
                localStorage.removeItem("searchHistory")
            }
        }
    }, [])

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

    // function to save to history
    const saveToHistory = useCallback(
        (searchType, query, appInfo = null) => {
            console.log(appInfo)
            const timestamp = new Date().toISOString()
            let newSearchRecord;
            switch (searchType) {
                case "developerId":
                    console.log(appInfo)
                    newSearchRecord = {
                        id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
                        type: searchType,
                        query,
                        timestamp,
                        appInfo: appInfo
                            ? {
                                name: appInfo.developerName,
                                id: appInfo.developerId,
                            }
                            : null,
                    }
                    break;
                default:
                    newSearchRecord = {
                        id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
                        type: searchType,
                        query,
                        timestamp,
                        appInfo: appInfo
                            ? {
                                title: appInfo.title,
                                bundleId: appInfo.appId,
                                appId: appInfo.id,
                            }
                            : null,
                    }
                    break;
            }

            const updatedHistory = [newSearchRecord, ...searchHistory.slice(0, 19)]
            setSearchHistory(updatedHistory)
            localStorage.setItem("searchHistory", JSON.stringify(updatedHistory))
        },
        [searchHistory, setSearchHistory],
    )

    // add a helper function to clear search inputs except for the active one
    const clearSearchInputs = useCallback(
        (activeType = null, preserveResults = false) => {
            // only clear results if not preserving them
            if (!preserveResults) {
                setResults(null)
            }

            setFromDeveloperList(false)

            // clear inputs except for the active one
            if (activeType !== "developerId") setDeveloperId("")
            if (activeType !== "appstoreId") setAppStoreId("")
            if (activeType !== "bundleId") setBundleId("")

            // always set the active input
            setActiveInput(activeType)
            setLoadingField(activeType)
        },
        [setActiveInput, setBundleId, setDeveloperId, setFromDeveloperList, setLoadingField, setResults, setAppStoreId],
    )

    // helper to manage localStorage storage usage
    const manageLocalStorageSpace = useCallback(() => {
        try {
            // check if localStorage is getting full (using 80% of quota as threshold)
            const maxSize = 5 * 1024 * 1024 // 5MB is a common limit
            let totalSize = 0

            // calculate current usage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key) {
                    totalSize += (key.length + localStorage.getItem(key)?.length || 0) * 2
                }
            }

            // if we're using more than 80% of quota, clean up old developer app caches
            if (totalSize > 0.8 * maxSize) {
                console.log("LocalStorage is getting full, cleaning up old caches")

                // Get all developer app cache keys and their timestamps
                const cacheKeys = []
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i)
                    if (key && key.startsWith("developerApps_")) {
                        try {
                            const data = JSON.parse(localStorage.getItem(key) || "{}")
                            cacheKeys.push({ key, timestamp: data.timestamp || 0 })
                        } catch (e) {
                            // Invalid JSON, remove it
                            localStorage.removeItem(key)
                        }
                    }
                }

                // Sort by timestamp (oldest first) and remove oldest entries until we're under 50% usage
                cacheKeys.sort((a, b) => a.timestamp - b.timestamp)

                for (const { key } of cacheKeys) {
                    localStorage.removeItem(key)

                    // Recalculate size after each removal
                    let newSize = 0
                    for (let i = 0; i < localStorage.length; i++) {
                        const k = localStorage.key(i)
                        if (k) {
                            newSize += (k.length + localStorage.getItem(k)?.length || 0) * 2
                        }
                    }

                    // Stop if we're under 50% usage
                    if (newSize < 0.5 * maxSize) {
                        break
                    }
                }
            }
        } catch (error) {
            console.error("Error managing localStorage space:", error)
        }
    }, [])

    // Run storage management on mount
    useEffect(() => {
        manageLocalStorageSpace()
    }, [manageLocalStorageSpace])

    const value = useMemo(
        () => ({
            // State
            appstoreId,
            setAppStoreId,
            bundleId,
            setBundleId,
            developerId,
            setDeveloperId,
            activeInput,
            setActiveInput,
            fromDeveloperList,
            setFromDeveloperList,
            viewMode,
            setViewMode,
            results,
            setResults,
            loading,
            setLoading,
            loadingField,
            setLoadingField,
            developerApps,
            setDeveloperApps,
            cachedDeveloperApps,
            setCachedDeveloperApps,
            isDarkMode,
            setIsDarkMode,
            searchHistory,
            setSearchHistory,
            isSearchVisible,
            setIsSearchVisible,

            // Helper functions
            saveToHistory,
            clearSearchInputs,
            manageLocalStorageSpace,
        }),
        [
            appstoreId,
            bundleId,
            developerId,
            activeInput,
            fromDeveloperList,
            viewMode,
            results,
            loading,
            loadingField,
            developerApps,
            cachedDeveloperApps,
            isDarkMode,
            searchHistory,
            isSearchVisible,
            saveToHistory,
            clearSearchInputs,
            manageLocalStorageSpace,
        ],
    )

    return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

export function useSearch() {
    const context = useContext(SearchContext)
    if (!context) {
        throw new Error("useSearch must be used within a SearchProvider")
    }
    return context
}