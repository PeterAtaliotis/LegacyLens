import requests

from flask import Flask, jsonify, request

def get_wikipedia_page_content_url_and_image(pageid, title):
    """
    Fetch the content, URL, and main image of a Wikipedia page using its page ID and title.

    :param pageid: The page ID of the Wikipedia article.
    :param title: The title of the Wikipedia article.
    :return: A dictionary containing the content, URL, and main image URL of the page.
    """
    base_url = "https://en.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "pageids": pageid,
        "prop": "extracts|pageimages",
        "exintro": "true",
        "explaintext": "true",
        "format": "json",
        "pithumbsize": 500  # Thumbnail image size
    }
    
    response = requests.get(base_url, params=params)
    data = response.json()
    
    page = data.get("query", {}).get("pages", {}).get(str(pageid), {})
    extract = page.get("extract", "Content not found.")
    image_url = page.get("thumbnail", {}).get("source", "")
    
    # Construct the URL to the Wikipedia page
    page_url = f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}"
    
    return {"content": extract, "url": page_url, "image_url": image_url}




def wikipedia_geosearch(latitude, longitude, radius=1000):
    """
    Perform a geosearch using the Wikipedia API to find pages near a specific location.

    :param latitude: Latitude of the location.
    :param longitude: Longitude of the location.
    :param radius: Search radius in meters (default 1000 meters).
    :return: List of Wikipedia articles near the given location.
    """
    base_url = "https://en.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "list": "geosearch",
        "gscoord": f"{latitude}|{longitude}",
        "gsradius": radius,
        "gslimit": "10",  # Adjust the limit as necessary.
        "format": "json"
    }
    
    response = requests.get(base_url, params=params)
    data = response.json()

    articles = data.get("query", {}).get("geosearch", [])
    return [{"title": article["title"], "pageid": article["pageid"]} for article in articles]


app = Flask(__name__)

@app.route('/geosearch', methods=['GET'])
def geosearch_content_image():
    latitude = request.args.get('latitude', type=float)
    longitude = request.args.get('longitude', type=float)
    radius = request.args.get('radius', default=200, type=int)
    
    if latitude is None or longitude is None:
        return jsonify({"error": "Latitude and longitude parameters are required."}), 400
    
    articles = wikipedia_geosearch(latitude, longitude, radius)
    if not articles:
        return jsonify({"message": "No nearby Wikipedia articles found."})
    
    # Fetch the content, URL, and image of the first article found
    first_article = articles[0]
    page_info = get_wikipedia_page_content_url_and_image(first_article["pageid"], first_article["title"])
    
    # Return the title, content, URL, and image URL
    return jsonify({"title": first_article["title"], **page_info})




if __name__ == '__main__':
    app.run(debug=True)
