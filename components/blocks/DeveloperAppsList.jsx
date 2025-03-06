import React from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { containerVariants, itemVariants } from "@/lib/animations"

const DeveloperAppsList = ({
    developerApps,
    setDeveloperApps,
    setCachedDeveloperApps,
    setDeveloperId,
    setViewMode,
    setResults,
    setFromDeveloperList,
    setActiveInput,
    copyToClipboard,
}) => {
    return (
        <motion.div
            key="list-view"
            className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-6 transition-colors duration-200"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
        >
            <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold dark:text-white">Developer Apps ({developerApps.length})</h2>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setDeveloperApps(null)
                        setCachedDeveloperApps(null)
                        setDeveloperId("")
                        setViewMode("none")
                        setActiveInput(null)
                    }}
                    className="text-gray-600 dark:text-gray-300"
                >
                    Clear
                </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="max-h-[600px] overflow-y-auto pr-2">
                <div className="space-y-6">
                    {developerApps.map((app, index) => (
                        <motion.div
                            key={app.id}
                            className="border-b dark:border-gray-700 pb-4 last:border-0 last:pb-0"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                transition: {
                                    delay: index * 0.05,
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
                                        transition={{ duration: 0.3, delay: index * 0.05 + 0.1 }}
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
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => window.open(app.url, "_blank")}
                                                className="h-8 w-8"
                                            >
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
                    ))}
                </div>
            </motion.div>
        </motion.div>
    )
}

export default DeveloperAppsList