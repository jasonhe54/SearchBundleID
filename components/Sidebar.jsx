"use client"

import { useSearch } from "@/context/SearchContext"
import { fetchByAppIdOrBundleId, fetchByDeveloperId } from "@/lib/fetchData"
import { validateInput } from "@/lib/helpers"
import { toast } from "sonner"
import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search } from "lucide-react"
import SearchHistory from "@/components/search/SearchHistory"

// Smart detection of search type
function detectSearchType(query) {
  if (!query || query.trim() === "") return null

  const trimmed = query.trim()

  if (trimmed.includes(".") && /^[a-zA-Z0-9.-]+$/.test(trimmed)) {
    return "bundleId"
  }

  if (/^\d+$/.test(trimmed)) {
    return "appstoreId"
  }

  return null
}

export default function Sidebar() {
  const {
    searchHistory,
    setSearchHistory,
    setResults,
    setDeveloperApps,
    setCachedDeveloperApps,
    setFromDeveloperList,
    saveToHistory,
    clearSearchInputs,
  } = useSearch()

  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [detectedType, setDetectedType] = useState(null)

  const clearHistory = useCallback(() => {
    setSearchHistory([])
    localStorage.removeItem("searchHistory")
    toast.success("Search history cleared")
  }, [setSearchHistory])

  const removeHistoryItem = useCallback(
    (id) => {
      const updatedHistory = searchHistory.filter((item) => item.id !== id)
      setSearchHistory(updatedHistory)
      localStorage.setItem("searchHistory", JSON.stringify(updatedHistory))
    },
    [searchHistory, setSearchHistory],
  )

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value
    setSearchQuery(value)
    const detected = detectSearchType(value)
    setDetectedType(detected)
  }, [])

  const performSearch = useCallback(
    async (query, searchType = null) => {
      if (!query || query.trim() === "") return

      const trimmed = query.trim()
      const type = searchType || detectSearchType(trimmed)

      if (!type) {
        toast.error("Invalid Input", {
          description: "Please enter a valid App ID, Developer ID, or Bundle ID",
          duration: 3500,
        })
        return
      }

      clearSearchInputs(null)
      setLoading(true)

      try {
        if (type === "bundleId") {
          if (!validateInput("bundleId", trimmed)) {
            throw new Error("Invalid Bundle ID")
          }
          const respData = await fetchByAppIdOrBundleId("bundleId", trimmed, false)
          if (respData) {
            setResults(respData)
            setDeveloperApps(null)
            setFromDeveloperList(false)
            saveToHistory("bundleId", trimmed, respData)
          }
        } else if (type === "developerId") {
          // Direct Developer ID search (from history or explicit)
          if (!validateInput("developerId", trimmed)) {
            throw new Error("Invalid Developer ID")
          }
          const devData = await fetchByDeveloperId(trimmed)
          if (devData && devData.data) {
            setDeveloperApps(devData.data)
            setCachedDeveloperApps(devData.data)
            setResults(null)
            saveToHistory("developerId", trimmed, {
              developerName: devData.developerName,
              developerId: trimmed,
            })
          }
        } else if (type === "appstoreId") {
          if (!validateInput("appstoreId", trimmed)) {
            throw new Error("Invalid App ID")
          }
          // Try App ID first (suppress errors since we'll try Developer ID next)
          const respData = await fetchByAppIdOrBundleId("appstoreId", trimmed, false, true)
          if (respData) {
            setResults(respData)
            setDeveloperApps(null)
            setFromDeveloperList(false)
            saveToHistory("appstoreId", trimmed, respData)
            return
          }

          console.log("App ID search returned no results, trying Developer ID...")
          if (!validateInput("developerId", trimmed)) {
            toast.error("No results found", {
              description: `No app found with ID "${trimmed}". It doesn't match a valid Developer ID format.`,
              duration: 3500,
            })
            return
          }
          const devData = await fetchByDeveloperId(trimmed)
          if (devData && devData.data) {
            setDeveloperApps(devData.data)
            setCachedDeveloperApps(devData.data)
            setResults(null)
            saveToHistory("developerId", trimmed, {
              developerName: devData.developerName,
              developerId: trimmed,
            })
          } else {
            toast.error("No results found", {
              description: `No app or developer found with ID "${trimmed}"`,
              duration: 3500,
            })
          }
        }
      } catch (error) {
        return
      } finally {
        setLoading(false)
        setDetectedType(null)
        setSearchQuery("")
      }
    },
    [clearSearchInputs, saveToHistory, setCachedDeveloperApps, setDeveloperApps, setFromDeveloperList, setResults],
  )

  const handleSearch = useCallback(
    async (e) => {
      e?.preventDefault()
      await performSearch(searchQuery)
    },
    [searchQuery, performSearch],
  )

  const handleHistoryClick = useCallback(
    async (item) => {
      await performSearch(item.query, item.type)
    },
    [performSearch],
  )

  const getSearchHint = () => {
    if (!searchQuery) return "Enter App ID, Developer ID, or Bundle ID"
    if (detectedType === "bundleId") return "Bundle ID detected"
    if (detectedType === "appstoreId") return "App ID (tries Developer ID if not found)"
    return "Enter App ID, Developer ID, or Bundle ID"
  }

  return (
    <aside className="w-full md:w-72 border-r border-border/40 bg-card flex flex-col md:h-[calc(100vh-3.5rem)] overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Unified Search */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Search
          </label>
          <form onSubmit={handleSearch} className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="App ID, Developer ID, or Bundle ID"
                className="flex-1 h-10 text-sm bg-input border-border/50"
                autoCapitalize="off"
                value={searchQuery}
                onChange={handleSearchChange}
                disabled={loading}
              />
              <Button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                size="icon"
                className="h-10 w-10 shrink-0"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground/70 px-1 whitespace-nowrap overflow-hidden text-ellipsis">
              {getSearchHint()}
            </p>
          </form>
        </div>

        {/* Search History - Desktop only */}
        <div className="hidden md:block pt-2 border-t border-border/40">
          <SearchHistory
            searchHistory={searchHistory}
            clearHistory={clearHistory}
            removeHistoryItem={removeHistoryItem}
            onHistoryItemClick={handleHistoryClick}
          />
        </div>
      </div>
    </aside>
  )
}
