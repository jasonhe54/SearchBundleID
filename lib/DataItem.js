import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

// Helper component for displaying data items
function DataItem({ label, value, copyable = false, onCopy }) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <span className="text-xs text-gray-500 dark:text-gray-400 block">{label}</span>
        <span className="text-sm font-medium dark:text-white">{value || "N/A"}</span>
      </div>
      {copyable && value && (
        <Button variant="ghost" size="icon" onClick={onCopy} className="h-8 w-8">
          <Copy className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

export default DataItem;