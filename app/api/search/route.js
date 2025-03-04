const sAPI = require("app-store-scraper");

export async function POST(request) {

    const { appStoreUrl, appstoreId, bundleId, includeRatings } = await request.json();

    // Handle POST request when not through this App
    if (!appstoreId && !bundleId) {
        return new Response(JSON.stringify({ error: "Either appId or bundleId is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    let requestParams = {}
    if (appstoreId) {
        requestParams.id = appstoreId;
    } else if (bundleId) {
        requestParams.appId = bundleId;
    }
    if (includeRatings) {
        requestParams.ratings = includeRatings;
    }
    console.log(requestParams);

    let res = await sAPI.app(requestParams)
        .then((data) => {
            return data;
        })
        .catch((err) => {
            console.error(err);
        });

    // parse res to modify some response data
    res.url = res.url.split("?")[0];

    return new Response(JSON.stringify(res), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}