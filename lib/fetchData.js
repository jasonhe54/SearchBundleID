"use client";
import { toast } from "sonner";

/**
 * 
 * @param [] arrayOfInputs - array of inputs to search for
 * @returns RespData or undefined
 */
async function handleGenericSearch(arrayOfInputs) {
    console.log("In handleGenericSearch:", arrayOfInputs);

    let trimmedArray = arrayOfInputs.filter(input => {
        // Check the first key and validate its id value
        const key = Object.keys(input)[0];
        const idValue = input[key]?.id?.trim();
        return idValue && idValue !== "";  // Ensure id is not empty
    });

    if (trimmedArray.length === 0) {
        toast.error("An Error Occured Trying to Fetch Data", {
            description: "Please ensure you input a valid value to search for.",
            duration: 3500,
        });
        return
    }

    // at this point trimmed array should have ONLY 1 element (or we just consider the first element only)
    let input = trimmedArray[0]; // this is the JSON of the first element
    let key = Object.keys(input)[0]; // this gets the first key of that JSON above

    if (key === "appstoreId") {
        let value = input.appstoreId.id;
        let includeRatings = input.appstoreId.includeRatings;
        return await fetchByAppIdOrBundleId("appstoreId", value, includeRatings);
    } else if (key === "bundleId") {
        let value = input.bundleId.id;
        let includeRatings = input.bundleId.includeRatings;
        return await fetchByAppIdOrBundleId("bundleId", value, includeRatings);
    } else if (key === "developerId") {
        let value = input.developerId.id;
        return await fetchByDeveloperId(value); //stub
    } else {
        toast.error("An Error Occured Trying to Fetch Data", {
            description: "Invalid search input, ensure all parameters are entered correctly.",
            duration: 3500,
        });
        return
    }

}


/**
 * @param data - value of appstoreId or bundleId
 * @param includeRatings - boolean value to include ratings in the response
 * @param setLoadingState - function to set loading state
 * @param setResultsState - function to set results state
 * @returns RespData or undefined
 */
async function fetchByAppIdOrBundleId(key, value, includeRatings) {
    try {

        let res = await fetch("/api/search", {
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
            let errorData = await res.json();
            throw new Error(errorData.error || "Unknown error occurred");
        }

        let respData = await res.json();
        console.log("Response Data:", respData.data);
        return respData.data;
    } catch (error) {
        console.error("Error:", error);
        toast.error("An error occurred while fetching data. Please try again later.", {
            description: error.message,
            duration: 3500,
        });
        return
    }
}

/**
 * @param developerId - value of developerId
 * @result RespData or undefined
 */
async function fetchByDeveloperId(developerId) {
    try {
        let res = await fetch("/api/search/developer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                developerId,
            }),
        })
        if (!res.ok) {
            let errorData = await res.json();
            throw new Error(errorData.error || "Unknown error occurred");
        }

        let respData = await res.json();
        console.log("Response Data:", respData.data);
        return respData.data;
    } catch (error) {
        console.error("Error:", error);
        toast.error("An error occurred while fetching data. Please try again later.", {
            description: error.message,
            duration: 3500,
        });
        return
    }
}

export { fetchByAppIdOrBundleId, handleGenericSearch, fetchByDeveloperId };