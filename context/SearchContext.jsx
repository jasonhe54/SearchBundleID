"use client"

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"

const SearchContext = createContext(null)

// Cache expiration time (30 minutes)
const CACHE_EXPIRATION = 30 * 60 * 1000

export function SearchProvider({ children }) {
    const [appstoreId, setAppStoreId] = useState("")
    const [bundleId, setBundleId] = useState("")
    const [developerId, setDeveloperId] = useState("")
    const [activeInput, setActiveInput] = useState(null)
    const [fromDeveloperList, setFromDeveloperList] = useState(false)
    const [viewMode, setViewMode] = useState("none")
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [loadingField, setLoadingField] = useState(null)
    const [developerApps, setDeveloperApps] = useState(null)
    const [cachedDeveloperApps, setCachedDeveloperApps] = useState(null)
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [searchHistory, setSearchHistory] = useState([])
    const [isSearchVisible, setIsSearchVisible] = useState(true)
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

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }
        localStorage.setItem("theme", isDarkMode ? "dark" : "light")
    }, [isDarkMode])

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

            const deduplicatedHistory = searchHistory.filter(
                (item) => !(item.query === query && item.type === searchType)
            )

            const updatedHistory = [newSearchRecord, ...deduplicatedHistory.slice(0, 19)]
            setSearchHistory(updatedHistory)
            localStorage.setItem("searchHistory", JSON.stringify(updatedHistory))
        },
        [searchHistory, setSearchHistory],
    )

    const clearSearchInputs = useCallback(
        (activeType = null, preserveResults = false) => {
            if (!preserveResults) {
                setResults(null)
            }

            setFromDeveloperList(false)

            if (activeType !== "developerId") setDeveloperId("")
            if (activeType !== "appstoreId") setAppStoreId("")
            if (activeType !== "bundleId") setBundleId("")

            setActiveInput(activeType)
            setLoadingField(activeType)
        },
        [setActiveInput, setBundleId, setDeveloperId, setFromDeveloperList, setLoadingField, setResults, setAppStoreId],
    )

    const manageLocalStorageSpace = useCallback(() => {
        try {
            const maxSize = 5 * 1024 * 1024
            let totalSize = 0

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key) {
                    totalSize += (key.length + localStorage.getItem(key)?.length || 0) * 2
                }
            }

            if (totalSize > 0.8 * maxSize) {
                console.log("LocalStorage is getting full, cleaning up old caches")

                const cacheKeys = []
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i)
                    if (key && key.startsWith("developerApps_")) {
                        try {
                            const data = JSON.parse(localStorage.getItem(key) || "{}")
                            cacheKeys.push({ key, timestamp: data.timestamp || 0 })
                        } catch (e) {
                            localStorage.removeItem(key)
                        }
                    }
                }

                cacheKeys.sort((a, b) => a.timestamp - b.timestamp)

                for (const { key } of cacheKeys) {
                    localStorage.removeItem(key)

                    let newSize = 0
                    for (let i = 0; i < localStorage.length; i++) {
                        const k = localStorage.key(i)
                        if (k) {
                            newSize += (k.length + localStorage.getItem(k)?.length || 0) * 2
                        }
                    }

                    if (newSize < 0.5 * maxSize) {
                        break
                    }
                }
            }
        } catch (error) {
            console.error("Error managing localStorage space:", error)
        }
    }, [])

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