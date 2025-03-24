"use client"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Clock, X } from "lucide-react"
import { itemVariants } from "@/lib/animations"

// Format date for display in history
const formatHistoryDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Return search type label
const getSearchTypeLabel = (type) => {
  switch (type) {
    case "developerId":
      return "Developer ID"
    case "appstoreId":
      return "App ID"
    case "bundleId":
      return "Bundle ID"
    default:
      return "Search"
  }
}

const SearchHistory = ({ searchHistory, clearHistory, removeHistoryItem }) => {
  return (
    <motion.div className="mt-6 pt-4 border-t dark:border-gray-700" variants={itemVariants}>
      <motion.div className="flex justify-between items-center mb-2" variants={itemVariants}>
        <motion.h3 className="text-sm font-semibold dark:text-white" variants={itemVariants}>
          Search History
        </motion.h3>
        {searchHistory.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Clear All
          </Button>
        )}
      </motion.div>

      <motion.div
        className="max-h-[120px] overflow-y-auto pr-2 text-xs text-gray-600 dark:text-gray-300"
        variants={itemVariants}
      >
        {searchHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-4 text-gray-400">
            <Clock className="h-4 w-4 mb-1" />
            <p>No recent searches</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {searchHistory.map((item) => (
              <li key={item.id} className="pb-1 border-b dark:border-gray-700 flex justify-between items-center">
                <div className="flex-1 flex items-start px-1 py-0.5">
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{getSearchTypeLabel(item.type)}:</span>
                      <span className="truncate">{item.query}</span>
                    </div>
                    {item.appInfo?.title && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.appInfo.title}</div>
                    )}
                    {item.appInfo?.name && item.appInfo?.id && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.appInfo.name}</div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                    {formatHistoryDate(item.timestamp)}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeHistoryItem(item.id)
                  }}
                  className="ml-1 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Remove from history"
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </motion.div>
  )
}

export default SearchHistory