"use client"

import { memo } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Image from "next/image"

// Memoized app item component to prevent unnecessary re-renders
const AppItem = memo(({ app, index, setResults, setFromDeveloperList, setViewMode, copyToClipboard }) => {
  return (
    <motion.div
      key={app.id}
      className="border-b dark:border-gray-700 pb-4 last:border-0 last:pb-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          delay: Math.min(index * 0.03, 0.3), // Cap the delay to prevent too much staggering
          duration: 0.3,
        },
      }}
    >
      <div className="flex items-start gap-4 mb-2">
        {app.icon && (
          <motion.div
            className="flex-shrink-0"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) + 0.1 }}
          >
            <Image
              src={app.icon || "/placeholder.svg"}
              alt={app.title || "App icon"}
              width={60}
              height={60}
              className="rounded-xl"
            />
          </motion.div>
        )}
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold dark:text-white">{app.title}</h3>
            <div className="ml-auto flex gap-0">
              <Button variant="ghost" size="icon" onClick={() => window.open(app.url, "_blank")} className="h-8 w-8">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span className="truncate max-w-[200px]">{app.appId}</span>
            {app.free !== undefined && (
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                {app.free ? "Free" : `$${app.price}`}
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setResults(app)
                setFromDeveloperList(true)
                setViewMode("single")
              }}
            >
              View Details
            </Button>
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(app.appId)}>
              Copy Bundle ID
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
})

AppItem.displayName = "AppItem"

export default AppItem