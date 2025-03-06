export async function POST(request) {
    try {
      const { developerId } = await request.json()
  
      if (!developerId) {
        return new Response(JSON.stringify({ error: "developerId is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      }
  
      // Use the iTunes API directly with a large limit to fetch all apps at once
      const apiUrl = `https://itunes.apple.com/lookup?id=${developerId}&country=us&entity=software&limit=200&sort=recent`
  
      console.log(`Fetching from iTunes API: ${apiUrl}`)
  
      const response = await fetch(apiUrl)
  
      if (!response.ok) {
        throw new Error(`iTunes API responded with status: ${response.status}`)
      }
  
      const itunesData = await response.json()
      let developerName = itunesData.results[0].artistName
  
      // The first result is usually the developer info, not an app
      // Filter to only include apps and format the data to match our expected structure
      const apps = itunesData.results
        .filter((item) => item.wrapperType === "software")
        .map((app) => ({
          id: app.trackId,
          appId: app.bundleId,
          title: app.trackName,
          url: app.trackViewUrl?.split("?")[0] || app.trackViewUrl,
          description: app.description,
          icon: app.artworkUrl512 || app.artworkUrl100,
          developer: app.artistName,
          developerId: app.artistId.toString(),
          free: app.price === 0,
          price: app.price,
          version: app.version,
          size: app.fileSizeBytes,
          released: app.releaseDate,
          updated: app.currentVersionReleaseDate,
          requiredOsVersion: app.minimumOsVersion,
          primaryGenre: app.primaryGenreName,
          contentRating: app.contentAdvisoryRating,
        }))
  
      const respJSON = {
        developerName: developerName,
        data: apps,
        error: null,
      }
  
      console.info("Response Data:", {
        appsCount: apps.length,
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
  
  