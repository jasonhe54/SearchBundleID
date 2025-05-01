"use client";

/**
 * Maps the iTunes API response format to the format expected by SingleAppView
 * Ensure size is properly mapped
 * @param {Object} appData - Data returned from client-side fetchByAppIdOrBundleId
 * @returns {Object} - Data in the format expected by SingleAppView
 */
export function mapToSingleAppViewFormat(appData) {
    if (!appData) return null;

    return {
        // Main app info
        title: appData.appName || appData.title || "",
        icon: appData.artworkUrl512 || appData.icon || "",
        url: appData.appUrl || appData.url || "",
        appId: appData.bundleId || appData.appId || "",
        id: (appData.appId ? appData.appId.toString() : appData.id) || "",

        // Developer info
        developer: appData.developer || "Unknown Developer",
        developerId: appData.developerId || "",

        // Pricing info
        free: appData.price === 0,
        price: appData.price,

        // Content info
        contentRating: appData.contentRating || "",
        description: appData.description || "",
        version: appData.version || "",

        // App size - properly mapped to the format expected by SingleAppView
        size: appData.fileSizeBytes || appData.size || "0",

        // Dates
        released: appData.releaseDate || appData.released || "",
        updated: appData.lastUpdated || appData.updated || "",

        // Technical info
        requiredOsVersion: appData.minimumOsVersion || appData.requiredOsVersion || "",
        primaryGenre: appData.genre || appData.primaryGenre || appData.primaryGenreName || ""
    };
}

/**
 * Maps the iTunes API response format to the format expected by AppItem in the developer list
 * @param {Object} appData - Raw app data from the API
 * @returns {Object} - Data in the format expected by AppItem
 */
export function mapAppItemFromAPIFormat(appData) {
    if (!appData) return null;

    return {
        // Main app info
        title: appData.appName || appData.title || "",
        icon: appData.artworkUrl512 || appData.icon || "",
        url: appData.appUrl || appData.url || "",
        appId: appData.bundleId || appData.appId || "",
        id: (appData.appId ? appData.appId.toString() : appData.id) || "",

        // Developer info
        developer: appData.developer || "Unknown Developer",
        developerId: appData.developerId || "",

        // Pricing info
        free: appData.price === 0,
        price: appData.price,

        // Content info
        contentRating: appData.contentRating || "",
        version: appData.version || "",

        // App size for AppItem
        size: appData.fileSizeBytes || appData.size || "0",
        fileSizeBytes: appData.fileSizeBytes || appData.size || "0",

        // Dates
        released: appData.releaseDate || appData.released || "",
        updated: appData.lastUpdated || appData.updated || "",

        // Technical info
        requiredOsVersion: appData.minimumOsVersion || appData.requiredOsVersion || "",
        primaryGenre: appData.genre || appData.primaryGenre || appData.primaryGenreName || ""
    };
}