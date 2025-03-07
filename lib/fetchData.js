"use client";
import { toast } from "sonner";

/**
 * @param data - value of appstoreId or bundleId
 * @param includeRatings - boolean value to include ratings in the response
 * @param setLoadingState - function to set loading state
 * @param setResultsState - function to set results state
 * @returns RespData or undefined
 */
async function fetchByAppIdOrBundleId(key, value, includeRatings) {

    try {
        const res = await fetch("/api/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                [key]: value,
                includeRatings,
            }),
        })
        if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.error || "Unknown error occurred")
        }

        const respData = await res.json()
        console.log("Response Data:", respData.data)

        return respData.data
    } catch (error) {
        console.error("Error:", error)
        toast.error("An error occurred while fetching data. Please try again later.", {
            description: error.message,
            duration: 3500,
        })
        return
    }
}

/**
 * @param developerId - value of developerId
 * @returns {Promise<Object>} - Apps data or undefined on error
 */
async function fetchByDeveloperId(developerId) {

    try {
        const res = await fetch("/api/search/developer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                developerId,
            }),
        })
        if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.error || "Unknown error occurred")
        }

        const respData = await res.json()
        console.log("Response Data:", respData)

        return respData
    } catch (error) {
        console.error("Error:", error)
        toast.error("An error occurred while fetching data. Please try again later.", {
            description: error.message,
            duration: 3500,
        })
        return
    }
}  

export { fetchByAppIdOrBundleId, fetchByDeveloperId };