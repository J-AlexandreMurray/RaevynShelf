export async function handler(event) {
    const url = event.queryStringParameters.url;
  
    if (!url || !url.includes("archiveofourown.org")) {
      return {
        statusCode: 400,
        body: "Invalid URL"
      };
    }
  
    try {
      const response = await fetch(url);
      const html = await response.text();
  
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "text/html"
        },
        body: html
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: "Failed to fetch AO3 page"
      };
    }
  }