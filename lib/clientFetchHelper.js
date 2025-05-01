"use client";

// Cache expiration time (10 minutes)
const CACHE_EXPIRATION = 10 * 60 * 1000;

/**
 * Generate iTunes API URL for developer lookup
 */
export function formDeveloperURL(devIds, country = "us", limit = 1000) {
    try {
        const devIdString = devIds.join(",");
        return `https://itunes.apple.com/lookup?id=${devIdString}&country=${country}&entity=software&sort=recent&limit=${limit}`;
    } catch (error) {
        console.error("Error generating developer URL:", error);
        throw new Error("Failed to generate URL");
    }
}

/**
 * Generate iTunes API URL for app ID lookup
 */
export function formAppIdURL(appId, country = "us") {
    return `https://itunes.apple.com/lookup?id=${appId}&country=${country}&entity=software`;
}

/**
 * Generate iTunes API URL for bundle ID lookup
 */
export function formBundleIdURL(bundleId, country = "us") {
    return `https://itunes.apple.com/lookup?bundleId=${bundleId}&country=${country}&entity=software`;
}

/**
 * Sort apps based on the requested method
 */
export const sortingFunctions = {
    name: (a, b) => a.appName.localeCompare(b.appName),
    release_asc: (a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime(),
    release_desc: (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime(),
    updated_asc: (a, b) => new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime(),
    updated_desc: (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
    rating_desc: (a, b) => b.averageRating - a.averageRating,
    rating_asc: (a, b) => a.averageRating - b.averageRating,
    rating_count_desc: (a, b) => b.ratingCount - a.ratingCount,
    rating_count_asc: (a, b) => a.ratingCount - b.ratingCount,
    price_desc: (a, b) => b.price - a.price,
    price_asc: (a, b) => a.price - b.price,
};

/**
 * Process an app item from iTunes API response
 */
export function processAppItem(item) {
    // Make sure we have required fields
    if (!item || !item.trackName || !item.trackId) {
        console.error("Invalid app data:", item);
        throw new Error("Invalid app data received from API");
    }

    // Ensure all required properties exist with fallbacks
    return {
        // Basic app info
        appName: item.trackName || "",
        appId: item.trackId || 0,
        bundleId: item.bundleId || "",
        releaseDate: item.releaseDate || "",
        lastUpdated: item.currentVersionReleaseDate || item.releaseDate || "",
        genre: item.primaryGenreName || "",
        primaryGenreName: item.primaryGenreName || "",
        price: typeof item.price === 'number' ? item.price : 0,

        // Ratings and content
        averageRating: typeof item.averageUserRating === 'number' ? item.averageUserRating : 0,
        ratingCount: typeof item.userRatingCount === 'number' ? item.userRatingCount : 0,
        contentRating: item.contentAdvisoryRating || "",

        // URLs and assets
        appUrl: item.trackViewUrl ? item.trackViewUrl.split("?")[0] : "",
        artworkUrl60: item.artworkUrl60 || "",
        artworkUrl100: item.artworkUrl100 || "",
        artworkUrl512: item.artworkUrl512 || item.artworkUrl100 || "",

        // Description and technical info
        description: item.description || "",
        minimumOsVersion: item.minimumOsVersion || "",
        version: item.version || "",

        // File size - properly captured from the API
        fileSizeBytes: item.fileSizeBytes || "0",
        size: item.fileSizeBytes || "0",

        // Developer info
        developer: item.artistName || "Unknown Developer",
        developerId: item.artistId ? item.artistId.toString() : "",

        // Add fields needed for DeveloperAppsList format compatibility
        title: item.trackName || "",
        id: item.trackId ? item.trackId.toString() : "",
        icon: item.artworkUrl512 || item.artworkUrl100 || "",
        url: item.trackViewUrl ? item.trackViewUrl.split("?")[0] : "",
        free: item.price === 0,
        primaryGenre: item.primaryGenreName || "",
        released: item.releaseDate || "",
        updated: item.currentVersionReleaseDate || item.releaseDate || "",
        requiredOsVersion: item.minimumOsVersion || ""
    };
}

/**
 * Process iTunes API data and organize it by developer
 */
export function processDeveloperApiData(jsonData, sortMethod = "updated_desc", limit = 0) {
    if (!jsonData || !jsonData.results || !Array.isArray(jsonData.results)) {
        console.error("Invalid API response:", jsonData);
        throw new Error("Invalid API response format");
    }

    const organizedData = {};

    // Process the response and organize data in one pass
    jsonData.results.forEach((item) => {
        if (!item.trackName || !item.trackId) return;

        const developerId = item.artistId.toString();
        const developerName = item.artistName || "Unknown Developer";

        // Initialize developer data if not already present
        if (!organizedData[developerId]) {
            organizedData[developerId] = {
                developerName: developerName,
                developerId: developerId,
                developerUrl: item.artistViewUrl || "",
                apps: [],
            };
        }

        try {
            const app = processAppItem(item);
            // Add the app to the corresponding developer's list
            organizedData[developerId].apps.push(app);
        } catch (error) {
            console.warn("Skipping invalid app data:", error);
        }
    });

    // If no valid data was found
    if (Object.keys(organizedData).length === 0) {
        throw new Error("No valid app data found in the response");
    }

    // Sort and optionally limit the data
    Object.values(organizedData).forEach((dev) => {
        // Sort the apps based on the sorting method
        if (sortingFunctions[sortMethod]) {
            dev.apps.sort(sortingFunctions[sortMethod]);
        }

        // Apply the limit to the sorted apps only if limit is > 0
        // If limit is 0 or negative, return all apps
        if (limit > 0 && dev.apps.length > limit) {
            dev.apps = dev.apps.slice(0, limit);
        }
    });

    return organizedData;
}

/**
 * Check localStorage for cached developer apps
 */
export function checkCachedDeveloperApps(developerId) {
    if (!developerId) return null;

    try {
        const cachedData = localStorage.getItem(`developerApps_${developerId}`);
        if (cachedData) {
            const parsed = JSON.parse(cachedData);
            // Check if cache is still valid
            if (parsed && parsed.data && parsed.timestamp &&
                Date.now() - parsed.timestamp < CACHE_EXPIRATION) {
                return parsed.data;
            } else {
                // Cache expired or invalid, remove it
                localStorage.removeItem(`developerApps_${developerId}`);
            }
        }
    } catch (error) {
        console.error("Error reading from localStorage:", error);
        // Clear potentially corrupted cache
        try {
            localStorage.removeItem(`developerApps_${developerId}`);
        } catch (e) {
            // Ignore errors when clearing cache
        }
    }
    return null;
}

/**
 * Check localStorage for cached app data
 */
export function checkCachedApp(key, value) {
    if (!key || !value) return null;

    try {
        const cacheKey = `app_${key}_${value}`;
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
            const parsed = JSON.parse(cachedData);
            // Check if cache is still valid
            if (parsed && parsed.data && parsed.timestamp &&
                Date.now() - parsed.timestamp < CACHE_EXPIRATION) {
                return parsed.data;
            } else {
                // Cache expired or invalid, remove it
                localStorage.removeItem(cacheKey);
            }
        }
    } catch (error) {
        console.error("Error reading from localStorage:", error);
        // Clear potentially corrupted cache
        try {
            localStorage.removeItem(`app_${key}_${value}`);
        } catch (e) {
            // Ignore errors when clearing cache
        }
    }
    return null;
}

/**
 * Save developer apps to localStorage
 */
export function cacheDeveloperApps(developerId, data) {
    if (!developerId || !data) return;

    try {
        const cacheData = {
            data,
            timestamp: Date.now(),
        };
        localStorage.setItem(`developerApps_${developerId}`, JSON.stringify(cacheData));
    } catch (error) {
        console.error("Error saving to localStorage:", error);
    }
}

/**
 * Save app data to localStorage
 */
export function cacheApp(key, value, data) {
    if (!key || !value || !data) return;

    try {
        const cacheData = {
            data,
            timestamp: Date.now(),
        };
        localStorage.setItem(`app_${key}_${value}`, JSON.stringify(cacheData));
    } catch (error) {
        console.error("Error saving to localStorage:", error);
    }
}