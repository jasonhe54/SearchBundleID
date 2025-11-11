"use client";

import { toast } from "sonner";
import {
    formAppIdURL,
    formBundleIdURL,
    formDeveloperURL,
    processDeveloperApiData,
    processAppItem,
    checkCachedDeveloperApps,
    checkCachedApp,
    cacheDeveloperApps,
    cacheApp
} from "./clientFetchHelper";
import { mapToSingleAppViewFormat } from "./responseMapper";

/**
 * Fetch app data by App ID or Bundle ID - client-side implementation
 * @param key - "appstoreId" or "bundleId"
 * @param value - The ID to look up
 * @param includeRatings - Whether to include ratings in the response
 * @param suppressErrors - If true, don't show error toasts (useful for fallback attempts)
 * @returns App data formatted for SingleAppView or undefined on error
 */
async function fetchByAppIdOrBundleId(key, value, includeRatings, suppressErrors = false) {
    try {
        // First check cache
        const cachedData = checkCachedApp(key, value);
        if (cachedData) {
            console.log(`Using cached ${key} data for ${value}`);
            // Convert to the format expected by SingleAppView
            return mapToSingleAppViewFormat(cachedData);
        }

        // Determine which URL to use
        let url;
        if (key === "appstoreId") {
            url = formAppIdURL(value);
        } else if (key === "bundleId") {
            url = formBundleIdURL(value);
        } else {
            throw new Error(`Invalid key: ${key}`);
        }

        console.log(`Fetching from iTunes API: ${url}`);

        // Make the API request
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const jsonData = await response.json();

        if (jsonData.resultCount === 0 || !jsonData.results || !jsonData.results[0]) {
            throw new Error(`No results found for ${key}: ${value}`);
        }

        // Process the response data
        const appData = processAppItem(jsonData.results[0]);

        // Cache the processed data (before mapping to UI format)
        cacheApp(key, value, appData);

        // Map to the format expected by SingleAppView
        const formattedData = mapToSingleAppViewFormat(appData);
        console.log("Formatted data for SingleAppView:", formattedData);

        return formattedData;
    } catch (error) {
        console.error("Error:", error);
        // Only show error toast if not suppressed (for fallback attempts)
        if (!suppressErrors) {
            const errorMessage = error.message || "An error occurred while fetching data";
            toast.error(errorMessage.includes("No results found") 
                ? errorMessage 
                : "An error occurred while fetching data", {
                description: errorMessage.includes("No results found") 
                    ? undefined 
                    : errorMessage,
                duration: 3500,
            });
        }
        return undefined;
    }
}

/**
 * Fetch developer apps - client-side implementation
 * @param developerId - Developer ID to look up
 * @returns Developer data or undefined on error
 */
async function fetchByDeveloperId(developerId) {
    try {
        // First check cache
        const cachedData = checkCachedDeveloperApps(developerId);
        if (cachedData) {
            console.log("Using cached developer apps data");
            return {
                developerName: cachedData[0]?.developer || "Unknown Developer",
                data: cachedData
            };
        }

        // Convert developerId string to number array
        const devIds = developerId.split(",").map(id => parseInt(id.trim(), 10));

        // Generate iTunes API URL with maximum limit (200 is a safe maximum for iTunes API)
        // Use 1000 or the maximum your API can handle
        const apiUrl = formDeveloperURL(devIds, "us", 1000);
        console.log("Fetching from iTunes API:", apiUrl);

        // Make the API request
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const jsonData = await response.json();

        // Process the API response data
        // Note: We're using "updated_desc" as the sort method but not limiting the number of apps
        const organizedData = processDeveloperApiData(jsonData, "updated_desc", 0);

        // Get the first developer's data
        const firstDevId = Object.keys(organizedData)[0];
        if (!firstDevId || !organizedData[firstDevId]) {
            throw new Error("No apps found for this developer");
        }

        const developerApps = organizedData[firstDevId].apps;
        const developerName = organizedData[firstDevId].developerName;

        // Create a stable array of processed apps with consistent properties
        const processedApps = developerApps.map(app => {
            // Only include the fields we need and ensure consistent naming
            return {
                // App identification
                id: app.appId.toString(),
                appId: app.bundleId,
                bundleId: app.bundleId,

                // Display info
                title: app.appName,
                appName: app.appName,
                icon: app.artworkUrl512,
                artworkUrl512: app.artworkUrl512,

                // Developer info
                developer: developerName,
                developerId: firstDevId,

                // Dates
                releaseDate: app.releaseDate,
                released: app.releaseDate,
                lastUpdated: app.lastUpdated,
                updated: app.lastUpdated,

                // Content info
                version: app.version,
                minimumOsVersion: app.minimumOsVersion,
                requiredOsVersion: app.minimumOsVersion,
                genre: app.genre,
                primaryGenre: app.genre,
                contentRating: app.contentRating,

                // App size - ensure both properties are present for compatibility
                fileSizeBytes: app.fileSizeBytes || "0",
                size: app.fileSizeBytes || "0",

                // Pricing
                price: app.price,
                free: app.price === 0,

                // URLs
                appUrl: app.appUrl,
                url: app.appUrl,

                // Description
                description: app.description
            };
        });

        // Cache the data
        cacheDeveloperApps(developerId, processedApps);

        return {
            developerName: developerName,
            data: processedApps
        };
    } catch (error) {
        console.error("Error fetching developer data:", error);
        // Show more descriptive error message
        const errorMessage = error.message || "An error occurred while fetching data";
        toast.error(errorMessage.includes("No apps found") || errorMessage.includes("No valid")
            ? errorMessage 
            : "An error occurred while fetching data", {
            description: errorMessage.includes("No apps found") || errorMessage.includes("No valid")
                ? undefined 
                : errorMessage,
            duration: 3500,
        });
        return undefined;
    }
}

export { fetchByAppIdOrBundleId, fetchByDeveloperId };