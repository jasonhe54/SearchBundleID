const sAPI = require("app-store-scraper");

export async function POST(request) {
    try {
        const { appStoreUrl, appstoreId, bundleId, includeRatings } = await request.json();

        if (!appstoreId && !bundleId) {
            return new Response(JSON.stringify({ error: "Either appId or bundleId is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        let requestParams = {};
        if (appstoreId) {
            requestParams.id = appstoreId;
        } else if (bundleId) {
            requestParams.appId = bundleId;
        }
        if (includeRatings) {
            requestParams.ratings = includeRatings;
        }

        console.log("Request Params:", requestParams);

        const data = await sAPI.app(requestParams);
        data.url = data.url.split("?")[0];

        let respJSON = {
            data,
            error: null,
        }

        return new Response(JSON.stringify(respJSON), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("Error fetching app data:", err);
        
        let statusCode = 500;
        let errorMessage = "Internal Server Error";

        if (err.message.includes("App not found")) {
            statusCode = 404;
            errorMessage = "App not found";
        } else if (err.message.includes("Invalid")) {
            statusCode = 400;
            errorMessage = "Invalid request parameters";
        }

        return new Response(JSON.stringify({ error: errorMessage }), {
            status: statusCode,
            headers: { "Content-Type": "application/json" },
        });
    }
}