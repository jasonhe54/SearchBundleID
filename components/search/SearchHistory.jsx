"use client"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, X, History } from "lucide-react"

const formatHistoryDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const getSearchTypeLabel = (type) => {
  switch (type) {
    case "developerId":
      return "Developer"
    case "appstoreId":
      return "App ID"
    case "bundleId":
      return "Bundle ID"
    default:
      return "Search"
  }
}

const getSearchTypeBadgeVariant = (type) => {
  switch (type) {
    case "developerId":
      return "default"
    case "appstoreId":
      return "secondary"
    case "bundleId":
      return "outline"
    default:
      return "outline"
  }
}

const SearchHistory = ({ searchHistory, clearHistory, removeHistoryItem, onHistoryItemClick }) => {
  if (searchHistory.length === 0) {
    return (
      <Card className="border-border/40">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <History className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Search History</h3>
          </div>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Clock className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-xs text-muted-foreground">No recent searches</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/40">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Search History</h3>
            <Badge variant="secondary" className="text-xs">{searchHistory.length}</Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="h-7 px-2 text-xs"
          >
            Clear
          </Button>
        </div>
        <div className="max-h-[200px] overflow-y-auto space-y-2">
          {searchHistory.map((item) => (
            <motion.div
              key={item.id}
              className="flex items-center justify-between gap-2 p-2 rounded-md border border-border/40 bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => onHistoryItemClick && onHistoryItemClick(item)}
            >
              <div className="flex-1 min-w-0">
                <div className="mb-1">
                  <Badge variant={getSearchTypeBadgeVariant(item.type)} className="text-xs mb-1">
                    {getSearchTypeLabel(item.type)}
                  </Badge>
                  <div className="text-xs font-medium truncate">{item.query}</div>
                </div>
                {item.appInfo?.title && (
                  <p className="text-xs text-muted-foreground truncate">{item.appInfo.title}</p>
                )}
                {item.appInfo?.name && (
                  <p className="text-xs text-muted-foreground truncate">{item.appInfo.name}</p>
                )}
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  {formatHistoryDate(item.timestamp)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={(e) => {
                  e.stopPropagation()
                  removeHistoryItem(item.id)
                }}
                aria-label="Remove from history"
              >
                <X className="h-3 w-3" />
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default SearchHistory
