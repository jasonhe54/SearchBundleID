"use client";
import { toast } from "sonner";

// Simple in-memory cache
const cache = {
    developerIds: {},
    appIds: {},
    bundleIds: {},
}

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000

/**
 * @param data - value of appstoreId or bundleId
 * @param includeRatings - boolean value to include ratings in the response
 * @param setLoadingState - function to set loading state
 * @param setResultsState - function to set results state
 * @returns RespData or undefined
 */
async function fetchByAppIdOrBundleId(key, value, includeRatings) {
    // Check cache first
    const cacheKey = key === "appstoreId" ? "appIds" : "bundleIds"
    const cacheEntry = cache[cacheKey][value]

    if (cacheEntry && Date.now() - cacheEntry.timestamp < CACHE_EXPIRATION) {
        console.log("Using cached data for", key, value)
        return cacheEntry.data
    }

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

        // Cache the result
        cache[cacheKey][value] = {
            data: respData.data,
            timestamp: Date.now(),
        }

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
    // Check cache first
    const cacheEntry = cache.developerIds[developerId]

    if (cacheEntry && Date.now() - cacheEntry.timestamp < CACHE_EXPIRATION) {
        console.log("Using cached data for developerId", developerId)
        return cacheEntry.data
    }

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

        // Cache the result
        cache.developerIds[developerId] = {
            data: respData,
            timestamp: Date.now(),
        }

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