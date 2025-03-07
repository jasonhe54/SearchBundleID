import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Image from "next/image";
import { containerVariants, itemVariants } from "@/lib/animations";
import DataItem from "@/lib/DataItem";
import { formatBytes, formatDate } from "@/lib/helpers";

const CombinedView = ({
  viewMode,
  results,
  developerApps,
  fromDeveloperList,
  setViewMode,
  setDeveloperApps,
  cachedDeveloperApps,
  setCachedDeveloperApps,
  setDeveloperId,
  setResults,
  setFromDeveloperList,
  setActiveInput,
  clearResults,
  copyToClipboard,
}) => {
  return (
    <AnimatePresence mode="wait">
      {viewMode === "single" && results && (
        <motion.div
          key="single-view"
          className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-6 transition-colors duration-200"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          layout
        >
          <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold dark:text-white">Results</h2>
            <div className="flex gap-2">
              {fromDeveloperList && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="text-gray-600 dark:text-gray-300"
                >
                  Back to List
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={clearResults}
                className="text-gray-600 dark:text-gray-300"
              >
                Clear
              </Button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-start gap-4 mb-6">
            {results.icon && (
              <motion.div
                className="flex-shrink-0"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={results.icon || "/placeholder.svg"}
                  alt={results.title || "App icon"}
                  width={80}
                  height={80}
                  className="rounded-xl"
                />
              </motion.div>
            )}
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl font-bold dark:text-white">{results.title}</h1>
                <div className="ml-auto flex gap-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(results.url, "_blank")}
                    className="h-8 w-8"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span>{results.developer}</span>
                {results.free !== undefined && (
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                    {results.free ? "Free" : `$${results.price}`}
                  </span>
                )}
                {results.contentRating && (
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                    {results.contentRating}
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4 mb-4">
            <DataItem
              label="App Store URL"
              value={results.url}
              copyable
              onCopy={() => copyToClipboard(results.url)}
            />
            <DataItem
              label="Bundle ID"
              value={results.appId}
              copyable
              onCopy={() => copyToClipboard(results.appId)}
            />
            <DataItem 
              label="App ID" 
              value={results.id} 
              copyable 
              onCopy={() => copyToClipboard(results.id)} 
            />
            <DataItem
              label="Developer ID"
              value={results.developerId}
              copyable
              onCopy={() => copyToClipboard(results.developerId)}
            />
            <DataItem
              label="Version"
              value={results.version}
              copyable
              onCopy={() => copyToClipboard(results.version)}
            />
            <DataItem
              label="Size"
              value={formatBytes(results.size)}
              copyable
              onCopy={() => copyToClipboard(formatBytes(results.size))}
            />
            <DataItem
              label="Released"
              value={formatDate(results.released)}
              copyable
              onCopy={() => copyToClipboard(formatDate(results.released))}
            />
            <DataItem
              label="Updated"
              value={formatDate(results.updated)}
              copyable
              onCopy={() => copyToClipboard(formatDate(results.updated))}
            />
            <DataItem
              label="Required OS"
              value={results.requiredOsVersion}
              copyable
              onCopy={() => copyToClipboard(results.requiredOsVersion)}
            />
            <DataItem
              label="Primary Genre"
              value={results.primaryGenre}
              copyable
              onCopy={() => copyToClipboard(results.primaryGenre)}
            />
          </motion.div>

          {results.description && (
            <motion.div variants={itemVariants}>
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>Description</AccordionTrigger>
                  <AccordionContent className={"text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line"}>
                    <div className="pb-4">{results.description}</div>
                    <Button
                      variant="outline"
                      className={"w-full"}
                      onClick={() => {
                        copyToClipboard(results.description);
                      }}
                    >
                      Copy Description
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          )}
        </motion.div>
      )}

      {viewMode === "list" && developerApps && (
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
                setDeveloperApps(null);
                setCachedDeveloperApps(null);
                setDeveloperId("");
                setViewMode("none");
                setActiveInput(null);
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
                            setResults(app);
                            setFromDeveloperList(true);
                            setViewMode("single");
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
      )}
    </AnimatePresence>
  );
};

export default CombinedView;
