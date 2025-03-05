const maxCachedAge = 1000*60*5; // 5 minutes - also default value
const sAPI = require("app-store-scraper").memoized({ maxAge: maxCachedAge });

export async function POST(request) {
    try {
        const { developerId } = await request.json();

        if (!developerId) {
            return new Response(JSON.stringify({ error: "developerId is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const data = await sAPI.developer({
            devId: developerId
        });
        data.forEach(app => {
            app.url = app.url.split("?")[0];
        });

        let respJSON = {
            data,
            error: null,
        }
        
        console.info("Response Data:", respJSON);

        return new Response(JSON.stringify(respJSON), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("Error fetching app data:", err);
        
        let statusCode = 500;
        let errorMessage = "Internal Server Error";

        return new Response(JSON.stringify({ error: errorMessage }), {
            status: statusCode,
            headers: { "Content-Type": "application/json" },
        });
    }
}