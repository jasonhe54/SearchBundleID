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
        const cachedData = checkCachedApp(key, value);
        if (cachedData) {
            console.log(`Using cached ${key} data for ${value}`);
            return mapToSingleAppViewFormat(cachedData);
        }

        let url;
        if (key === "appstoreId") {
            url = formAppIdURL(value);
        } else if (key === "bundleId") {
            url = formBundleIdURL(value);
        } else {
            throw new Error(`Invalid key: ${key}`);
        }

        console.log(`Fetching from iTunes API: ${url}`);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const jsonData = await response.json();

        if (jsonData.resultCount === 0 || !jsonData.results || !jsonData.results[0]) {
            throw new Error(`No results found for ${key}: ${value}`);
        }

        const appData = processAppItem(jsonData.results[0]);
        cacheApp(key, value, appData);
        const formattedData = mapToSingleAppViewFormat(appData);
        console.log("Formatted data for SingleAppView:", formattedData);

        return formattedData;
    } catch (error) {
        console.error("Error:", error);
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

        const devIds = developerId.split(",").map(id => parseInt(id.trim(), 10));
        const apiUrl = formDeveloperURL(devIds, "us", 1000);
        console.log("Fetching from iTunes API:", apiUrl);

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const jsonData = await response.json();
        const organizedData = processDeveloperApiData(jsonData, "updated_desc", 0);
        const firstDevId = Object.keys(organizedData)[0];
        if (!firstDevId || !organizedData[firstDevId]) {
            throw new Error("No apps found for this developer");
        }

        const developerApps = organizedData[firstDevId].apps;
        const developerName = organizedData[firstDevId].developerName;

        const processedApps = developerApps.map(app => {
            return {
                id: app.appId.toString(),
                appId: app.bundleId,
                bundleId: app.bundleId,
                title: app.appName,
                appName: app.appName,
                icon: app.artworkUrl512,
                artworkUrl512: app.artworkUrl512,
                developer: developerName,
                developerId: firstDevId,
                releaseDate: app.releaseDate,
                released: app.releaseDate,
                lastUpdated: app.lastUpdated,
                updated: app.lastUpdated,
                version: app.version,
                minimumOsVersion: app.minimumOsVersion,
                requiredOsVersion: app.minimumOsVersion,
                genre: app.genre,
                primaryGenre: app.genre,
                contentRating: app.contentRating,
                fileSizeBytes: app.fileSizeBytes || "0",
                size: app.fileSizeBytes || "0",
                price: app.price,
                free: app.price === 0,
                appUrl: app.appUrl,
                url: app.appUrl,
                description: app.description
            };
        });

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