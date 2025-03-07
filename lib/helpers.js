// / Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
    if (!bytes) return "Unknown"
    bytes = Number.parseInt(bytes)
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

// Helper function to format date
function formatDate(dateString) {
    if (!dateString) return "Unknown"
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

const allDigitsRegex = /^\d+$/
const allAlphaNumericRegex = /^[a-zA-Z0-9.]+$/
const allAlphaNumericWithDashesAndDotsRegex = /^[a-zA-Z0-9.-]+$/

// validate user input for fields
const validateInput = (type, value) => {
    if (type === "appstoreId") {
        return allDigitsRegex.test(value)
    } else if (type === "developerId") {
        return allAlphaNumericRegex.test(value)
    } else if (type === "bundleId") {
        return allAlphaNumericWithDashesAndDotsRegex.test(value)
    }
  }

// export items
export { formatBytes, formatDate, validateInput }