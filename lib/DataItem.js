import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

function DataItem({ label, value, copyable = false, onCopy }) {
  return (
    <div className="flex justify-between items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-medium break-words break-all">{value || "N/A"}</p>
      </div>
      {copyable && value && (
        <Button variant="ghost" size="icon" onClick={onCopy} className="h-8 w-8 shrink-0">
          <Copy className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

export default DataItem;
