"use client"

import { motion, AnimatePresence } from "framer-motion"
import { SearchProvider, useSearch } from "@/context/SearchContext"
import SearchPanel from "@/components/blocks/SearchPanel"
import CombinedView from "@/components/blocks/CombinedView"
import { memo } from "react"

const HomeContent = memo(function HomeContent() {
  const { isDarkMode, isSearchVisible } = useSearch()

  return (
    <div
      className={`flex items-center justify-center min-h-screen p-4 ${isDarkMode ? "dark bg-zinc-950" : "bg-gray-50"}`}
    >
      <AnimatePresence mode="sync">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 relative w-full mx-auto">
          {isSearchVisible && (
            <motion.div
              className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-6 transition-colors duration-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3 }}
              layout
            >
              <SearchPanel />
            </motion.div>
          )}

          <CombinedView />
        </div>
      </AnimatePresence>
    </div>
  )
})

export default function Home() {
  return (
    <SearchProvider>
      <HomeContent />
    </SearchProvider>
  )
}