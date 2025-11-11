"use client"

import { useState, useCallback, useEffect, useMemo, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Grid3x3, List, X } from "lucide-react"
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
  setDeveloperApps,
}) {
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)
  const [paginatedApps, setPaginatedApps] = useState([])
  const [displayMode, setDisplayMode] = useState("list")
  
  const processedDevApps = useMemo(() => {
    if (!Array.isArray(developerApps)) return [];
    return developerApps.map((app, index) => ({
      ...app,
      id: app.id || app.appId?.toString() || `app-${index}`
    }));
  }, [developerApps]);

  const totalPages = Math.max(1, Math.ceil(processedDevApps.length / itemsPerPage));

  useEffect(() => {
    if (processedDevApps.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setPaginatedApps(processedDevApps.slice(startIndex, endIndex));
      try {
        localStorage.setItem("developerAppsPage", currentPage.toString());
        localStorage.setItem("developerAppsPerPage", itemsPerPage.toString());
      } catch (error) {
        console.error("Failed to save pagination state:", error);
      }
    } else {
      setPaginatedApps([]);
    }
  }, [currentPage, processedDevApps, itemsPerPage]);

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
      console.error("Failed to load pagination state:", error);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [developerApps]);

  // Scroll to top when page changes (but not on initial mount)
  const isInitialMount = useRef(true);
  const headerRef = useRef(null);
  
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // Scroll immediately, then smooth scroll after a brief delay
    const mainElement = document.querySelector("main");
    if (mainElement) {
      // Instant scroll first to ensure we're at the top
      mainElement.scrollTo({ top: 0, behavior: "auto" });
      
      // Then do a smooth scroll after content updates
      requestAnimationFrame(() => {
        setTimeout(() => {
          mainElement.scrollTo({ top: 0, behavior: "smooth" });
        }, 50);
      });
    }
  }, [currentPage]);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    // Scroll immediately when button is clicked
    setTimeout(() => {
      const mainElement = document.querySelector("main");
      if (mainElement) {
        mainElement.scrollTo({ top: 0, behavior: "auto" });
      }
    }, 0);
  }, []);

  const handleItemsPerPageChange = useCallback((newValue) => {
    setItemsPerPage(newValue);
    setCurrentPage(1);
    // Scroll the main scrollable container to the top after state update
    setTimeout(() => {
      const mainElement = document.querySelector("main");
      if (mainElement) {
        mainElement.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 0);
  }, []);

  if (!processedDevApps || processedDevApps.length === 0) {
    return (
      <div className="space-y-6">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4 -mx-4 md:-mx-6 px-4 md:px-6 pt-4 md:pt-6 -mt-4 md:-mt-6 flex items-center justify-between border-b border-border/40">
          <div>
            <h1 className="text-2xl font-semibold">Developer Apps</h1>
            <p className="text-sm text-muted-foreground mt-0.5">No apps found</p>
          </div>
          <Button variant="ghost" size="icon" onClick={clearResults} className="h-9 w-9">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Card className="border-border/40">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No apps found for this developer.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div ref={headerRef} className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4 -mx-4 md:-mx-6 px-4 md:px-6 pt-4 md:pt-6 -mt-4 md:-mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-semibold">
              Developer Apps
              <Badge variant="secondary" className="ml-2 text-xs">
                {processedDevApps.length}
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Browse all apps from this developer</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-border/40 rounded-md p-0.5">
            <Button
              variant={displayMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDisplayMode("grid")}
              className="h-7 px-2"
            >
              <Grid3x3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={displayMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDisplayMode("list")}
              className="h-7 px-2"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" onClick={clearResults} className="h-9 w-9">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card className="border-border/40">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Items per page:</span>
              {[10, 20, 50, 100].map(value => (
                <Button
                  key={value}
                  variant={itemsPerPage === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleItemsPerPageChange(value)}
                  className="h-7 px-3 text-xs"
                >
                  {value}
                </Button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, processedDevApps.length)} of {processedDevApps.length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Apps List/Grid */}
      <div
        id="developer-apps-list"
        className={displayMode === "grid" 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          : "space-y-3"
        }
      >
        {paginatedApps.map((app, index) => (
          <AppItem
            key={app.id || `app-${index}`}
            app={app}
            index={index}
            setResults={(app) => {
              setResults(app)
              setDeveloperApps(null)
            }}
            setFromDeveloperList={setFromDeveloperList}
            setViewMode={setViewMode}
            copyToClipboard={copyToClipboard}
            viewMode={displayMode}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="border-border/40">
          <CardContent className="p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
