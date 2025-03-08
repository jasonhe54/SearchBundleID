export async function POST(request) {
    try {
        const { developerId } = await request.json()

        if (!developerId) {
            return new Response(JSON.stringify({ error: "developerId is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            })
        }

        // Use the custom API endpoint that returns data in the expected format
        const apiUrl = `${process.env.baseURLForDevLookupAPI}/api/lookupDeveloperIds?dIDs=${developerId}&country=us&entity=software&limit=200&sort=updated_desc`

        console.log(`Fetching from iTunes API: ${apiUrl}`)

        const response = await fetch(apiUrl)

        if (!response.ok) {
            throw new Error(`iTunes API responded with status: ${response.status}`)
        }

        const itunesData = await response.json()

        // Log the structure to understand it better
        console.log("API response structure:", {
            hasApiReqURL: Boolean(itunesData.apiReqURL),
            totalApps: itunesData.totalApps,
            dataKeys: Object.keys(itunesData.data || {})
        })

        // Check if we have the expected data structure
        if (!itunesData.data || !itunesData.data[developerId]) {
            console.error("Missing expected data structure in API response:", itunesData)
            throw new Error(`No data found for developer ID: ${developerId}`)
        }

        // Extract the developer info and apps from the response
        const developerInfo = itunesData.data[developerId]
        const developerName = developerInfo.developerName || "Unknown Developer"
        const apps = developerInfo.apps || []

        // Log the first app to understand its structure
        if (apps.length > 0) {
            console.log("First app keys:", Object.keys(apps[0]))
        }

        // Transform the apps to match the expected format
        const formattedApps = apps.map(app => ({
            id: app.appId,
            appId: app.bundleId,
            title: app.appName,
            url: app.appUrl,
            description: app.description,
            icon: app.artworkUrl512,
            developer: developerName,
            developerId: developerId,
            free: app.price === 0,
            price: app.price,
            version: app.version || "",
            size: app.size || "",
            released: app.releaseDate,
            updated: app.lastUpdated,
            requiredOsVersion: app.requiredOsVersion || "",
            primaryGenre: app.genre,
            contentRating: app.contentRating,
        }))

        const respJSON = {
            developerName: developerName,
            data: formattedApps,
            error: null,
        }

        console.info("Response Data:", {
            appsCount: formattedApps.length,
        })

        return new Response(JSON.stringify(respJSON), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        })
    } catch (err) {
        console.error("Error fetching app data:", err)

        const statusCode = 500
        const errorMessage = "Internal Server Error"

        return new Response(JSON.stringify({ error: errorMessage }), {
            status: statusCode,
            headers: { "Content-Type": "application/json" },
        })
    }
}
