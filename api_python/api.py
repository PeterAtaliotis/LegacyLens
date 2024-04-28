from flask import Flask, request, jsonify, make_response
from pymongo import MongoClient
from bson import ObjectId
import string
import datetime
from functools import wraps
from flask_cors import CORS
from bson.json_util import dumps
import os
import requests
import logging
import boto3
from werkzeug.exceptions import Unauthorized
from werkzeug.utils import secure_filename
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s')

app = Flask(__name__)
CORS(app)

AUTH0_DOMAIN = "dev-f8d6pf68bzrplu2y.us.auth0.com"

app.config['S3_BUCKET'] = os.getenv('S3_BUCKET')
app.config['S3_KEY'] = os.getenv('S3_KEY')
app.config['S3_SECRET'] = os.getenv('S3_SECRET')
app.config['S3_REGION'] = os.getenv('S3_REGION')
app.config['S3_LOCATION'] = f'http://s3.amazonaws.com/{app.config["S3_BUCKET"]}/'


s3 = boto3.client(
    "s3",
    aws_access_key_id=app.config['S3_KEY'],
    aws_secret_access_key=app.config['S3_SECRET'],
    region_name=app.config['S3_REGION']
)

client = MongoClient( "mongodb://127.0.0.1:27017" )  
db = client.LegacyLensDB
locations = db.locations
photos = db.photos

###########################################################################
##### Photo Endpoints
###########################################################################

@app.route('/upload', methods=['POST'])
def upload_file():
    user_id = request.form['user_id']
    location_id = request.form['location_id']
    description = request.form.get('description', '')
    alt_text = request.form.get('alt_text', '')

    file = request.files.get('file')
    if not file or not file.filename.lower().endswith('.jpg'):
        return jsonify({"error": "No JPEG file provided"}), 400

    photo_id = ObjectId()

    filename = secure_filename(file.filename)
    file_path = f"uploads/{filename}_{datetime.datetime.utcnow().isoformat()}.jpg"

    try:
        s3.upload_fileobj(
            file,
            app.config['S3_BUCKET'],
            file_path,
            ExtraArgs={"ContentType": "image/jpeg"} 
        )

        db.photos.insert_one({
            "_id": photo_id, 
            "location_id": ObjectId(location_id),
            "uploaded_by": user_id,
            "file_path": f"https://{app.config['S3_BUCKET']}.s3.{app.config['S3_REGION']}.amazonaws.com/{file_path}",
            "description": description,
            "upload_date": datetime.datetime.utcnow().isoformat(),
            "alt_text": alt_text,
            "url": f"https://{app.config['S3_BUCKET']}.s3-website.{app.config['S3_REGION']}.amazonaws.com/{file_path}"
        })
        return jsonify({"message": "File uploaded successfully", "file_url": f"https://{app.config['S3_BUCKET']}.s3.amazonaws.com/{file_path}", "photo_id": str(photo_id)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/photos', methods=['GET'])
def get_photos():
    user_id = request.args.get('user_id')
    location_id = request.args.get('location_id')

    query = {}

    if user_id:
        query['uploaded_by'] = user_id

    if location_id:
        try:
            query['location_id'] = ObjectId(location_id)
        except:
            return jsonify({"error": "Invalid location_id format"}), 400

    try:
        photos = db.photos.find(query)
        photos_list = []
        for photo in photos:
            photo['_id'] = str(photo['_id'])
            photo['location_id'] = str(photo['location_id'])
            photos_list.append(photo)

        return jsonify(photos_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/photos/<photo_id>', methods=['DELETE'])
def delete_photo(photo_id):
    try:
        user_id = request.json.get("user_id")

        photo = photos.find_one({"_id": ObjectId(photo_id), "uploaded_by": user_id})
        if not photo:
            return jsonify({"error": "Photo not found or user not authorized to delete this photo"}), 404

        s3_response = s3.delete_object(Bucket=os.getenv('S3_BUCKET'), Key=photo['file_path'])
        if s3_response['ResponseMetadata']['HTTPStatusCode'] != 204:
            return jsonify({"error": "Failed to delete the photo from S3"}), 500

        # Delete photo metadata from MongoDB
        photos.delete_one({"_id": ObjectId(photo_id)})

        return jsonify({"message": "Photo deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
    
@app.route("/api/photos/location/<string:id>", methods=["GET"])
def get_photos_by_location(id):
    if len(id) != 24 or not all(c in string.hexdigits for c in id):
        return make_response(jsonify({"error": "Invalid location ID"}), 404)

    try:
        location_obj_id = ObjectId(id)
        photos = db.photos.find({"location_id": location_obj_id})
        photos_list = []

        for photo in photos:
            photo['_id'] = str(photo['_id'])
            photo['location_id'] = str(photo['location_id'])
            photos_list.append(photo)

        if not photos_list:
            return make_response(jsonify({"message": "No photos found for this location"}), 404)

        return jsonify(photos_list)
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)


###################################################################
## LOCATION RETRIEVAL ENDPOINTS
##################################################################

@app.route("/api/home", methods=['GET'])
def return_home():
    return jsonify({
        'message': "Like this video if this helped!",
        'people': ['Jack', 'Harry', 'Arpan']
    })

def serialize_document(doc):
    """
    Recursively convert MongoDB document, converting all ObjectIds to strings.
    """
    if isinstance(doc, ObjectId):
        return str(doc)
    elif isinstance(doc, dict):
        for k, v in doc.items():
            doc[k] = serialize_document(v)
    elif isinstance(doc, list):
        return [serialize_document(item) for item in doc]
    return doc

@app.route("/api/locations/nearby", methods=["GET"])
def get_nearby_locations():
    user_lat = float(request.args.get('lat'))
    user_lng = float(request.args.get('lng'))
    radius = float(request.args.get('radius', 200))  # Default radius of 1000 meters

    query = {
        'geometry': {
            '$near': {
                '$geometry': {
                    'type': "Point",
                    'coordinates': [user_lng, user_lat]
                },
                '$maxDistance': radius
            }
        }
    }

    # Fetch locations using the geospatial query
    nearby_locations = locations.find(query)
    
    # Serialize each document, ensuring ObjectId instances are converted to strings
    data_to_return = [serialize_document(location) for location in nearby_locations]

    return make_response(jsonify(data_to_return), 200)

# get all locations raw
@app.route("/api/locations/all", methods=["GET"])
def show_all_locations():
    data_to_return = []
    for location in locations.find():
        location["_id"] = str(location["_id"])
        if 'properties' in location and 'comments' in location['properties']:
            # Iterate through each comment and convert _id to string
            for comment in location["properties"]["comments"]:
                comment["_id"] = str(comment["_id"])

        data_to_return.append(location)

    return make_response(jsonify(data_to_return), 200)

# get locations to for adjusted viewport
@app.route('/api/locations/viewport', methods=['GET'])
def get_locations_within_bounds():
    ne_lat = float(request.args.get('ne_lat'))
    ne_lng = float(request.args.get('ne_lng'))
    sw_lat = float(request.args.get('sw_lat'))
    sw_lng = float(request.args.get('sw_lng'))
    
    query = {
        'geometry': {
            '$geoWithin': {
                '$geometry': {
                    'type': "Polygon",
                    'coordinates': [[[sw_lng, sw_lat], [ne_lng, sw_lat], [ne_lng, ne_lat], [sw_lng, ne_lat], [sw_lng, sw_lat]]]
                }
            }
        }
    }
    
    locations_within_bounds = locations.find(query)
    return dumps(locations_within_bounds)



# get all locations paginated
@app.route("/api/locations", methods=["GET"])
def show_all_locations_paginated():
    page_num, page_size = 1, 10
    if request.args.get("pn"):
        page_num = int(request.args.get('pn'))
    if request.args.get("ps"):
        page_size = int(request.args.get('ps'))
    page_start = (page_size * (page_num - 1))

    data_to_return = []
    for location in locations.find().skip(page_start).limit(page_size):
        # Convert location's _id to string
        location["_id"] = str(location["_id"])

        # Ensure 'properties' exists and has 'comments'
        if 'properties' in location and 'comments' in location['properties']:
            # Iterate through each comment and convert _id to string
            for comment in location["properties"]["comments"]:
                comment["_id"] = str(comment["_id"])

        data_to_return.append(location)

    return make_response(jsonify(data_to_return), 200)


# get one location
@app.route("/api/locations/<string:id>", methods=["GET"])
def get_one_location(id):
        if len(id) != 24 or not all(c in string.hexdigits for c in id):
            return make_response( jsonify( {"error" : "Invalid location ID" } ), 404 )
        location = locations.find_one( {"_id" : ObjectId(id) } )
        if location is not None:
            location["_id"] = str(location["_id"])
            for comment in location["properties"]["comments"]:
                comment["_id"] = str(comment["_id"])
            return make_response( jsonify( [location]), 200 )
        else:
            return make_response( jsonify( {"error" : "Invalid location_list ID" } ), 404 )
        
        
##################################################
#####################  COMMENT ENDPOINTS
##################################################

#get all comments off a location  
@app.route("/api/locations/<string:id>/comments", methods=["GET"])
def fetch_all_comments(id):
    try:
        location = locations.find_one({"_id": ObjectId(id)}, {"properties.comments": 1, "_id": 0})
        
        if location and "properties" in location and "comments" in location["properties"]:
            data_to_return = [
                {**comment, "_id": str(comment["_id"])} for comment in location["properties"]["comments"]
            ]
        else:
            data_to_return = []
            
        return make_response(jsonify(data_to_return), 200)
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)
    
# get one comment off a location  
@app.route('/api/locations/<string:location_id>/comments/<string:comment_id>', methods=['GET'])
def fetch_one_comment(location_id, comment_id):
    try:
        pipeline = [
            {'$match': {'_id': ObjectId(location_id)}},
            {'$unwind': '$properties.comments'},
            {'$match': {'properties.comments._id': ObjectId(comment_id)}},
            {'$project': {'_id': 0, 'comment': '$properties.comments'}}
        ]
        result = locations.aggregate(pipeline)

        comment = next(result, None)
        if comment is None:
            return make_response(jsonify({"error": "Invalid location or comment ID"}), 404)
        
        comment['comment']['_id'] = str(comment['comment']['_id'])
        return make_response(jsonify(comment['comment']), 200)
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)

    
# post a comment
@app.route('/api/locations/<string:id>/comments', methods=['POST'])
def add_comment(id):
    try:
      
        user_id = request.json.get("user_id")
        username = request.json.get("username", "Anonymous")  #
        message_content = request.json.get("message_content")
        
        if not user_id or not message_content:
            return make_response(jsonify({'error': 'Missing necessary user data or message content'}), 400)

        comment = {
            '_id': ObjectId(),
            'user_id': user_id,
            'username': username,
            'dislikes': 0,
            'likes': 0,
            'message_content': message_content,
            'created_at': datetime.datetime.now(datetime.timezone.utc)
        }

        result = locations.update_one({'_id': ObjectId(id)}, {'$push': {'properties.comments': comment}})
        if result.matched_count == 0:
            return make_response(jsonify({'error': 'Location not found'}), 404)
        if result.modified_count == 0:
            return make_response(jsonify({'error': 'Comment not added'}), 500)

        comment['_id'] = str(comment['_id'])
        return make_response(jsonify({'message': 'Comment added successfully', 'comment': comment}), 201)
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)


# Delete comments
@app.route('/api/locations/<string:location_id>/comments/<string:comment_id>', methods=['DELETE'])
def delete_comment(location_id, comment_id):
    try:
        if not request.json:    
            return make_response(jsonify({'error': 'Missing JSON data'}), 400)

        user_id = request.json.get("user_id")
        if not user_id:
            return make_response(jsonify({'error': 'Missing necessary user ID'}), 400)

        comment_query = {
            '_id': ObjectId(location_id),
            'properties.comments': {
                '$elemMatch': {
                    '_id': ObjectId(comment_id),
                    'user_id': user_id  
                }
            }
        }

        update_action = {
            '$pull': {'properties.comments': {'_id': ObjectId(comment_id)}}
        }

        result = locations.update_one(comment_query, update_action)
        if result.modified_count == 0:
            return make_response(jsonify({'error': 'No comment found with provided user ID, or you do not have permission to delete this comment'}), 404)

        return make_response(jsonify({'message': 'Comment deleted successfully'}), 200)

    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)
        

# Edit Comment
@app.route('/api/locations/<string:location_id>/comments/<string:comment_id>', methods=['PUT'])
def edit_comment(location_id, comment_id):
    try:
        if not request.json:
            return make_response(jsonify({'error': 'Missing JSON data'}), 400)

        user_id = request.json.get("user_id")
        new_content = request.json.get("message_content")
        if not user_id or not new_content:
            return make_response(jsonify({'error': 'Missing necessary user ID or new content'}), 400)

        comment_query = {
            '_id': ObjectId(location_id),
            'properties.comments': {
                '$elemMatch': {
                    '_id': ObjectId(comment_id),
                    'user_id': user_id 
                }
            }
        }
        update_action = {
            '$set': {'properties.comments.$.message_content': new_content}
        }

        result = locations.update_one(comment_query, update_action)
        if result.modified_count == 0:
            return make_response(jsonify({'error': 'No comment found with provided user ID, or you do not have permission to edit this comment'}), 404)

        return make_response(jsonify({'message': 'Comment edited successfully'}), 200)

    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)
    

#like comments
@app.route('/api/locations/<string:location_id>/comments/<string:comment_id>/like', methods=['POST'])
def like_comment(location_id, comment_id):
    result = locations.update_one(
        {'_id': ObjectId(location_id), 'properties.comments._id': ObjectId(comment_id)},
        {'$inc': {'properties.comments.$.likes': 1}}
    )
    if result.modified_count:
        return make_response(jsonify({'message': 'Successfully incremented like'}), 200)
    else:
        return make_response(jsonify({'error': 'Unable to increment like'}), 400)
    
#dislike comments
@app.route('/api/locations/<string:location_id>/comments/<string:comment_id>/dislike', methods=['POST'])
def dislike_comment(location_id, comment_id):
    result = locations.update_one(
        {'_id': ObjectId(location_id), 'properties.comments._id': ObjectId(comment_id)},
        {'$inc': {'properties.comments.$.dislikes': 1}}
    )
    if result.modified_count:
        return make_response(jsonify({'message': 'Successfully incremented dislike'}), 200)
    else:
        return make_response(jsonify({'error': 'Unable to increment dislike'}), 400) 
    

#get user comments
@app.route("/api/users/<string:user_id>/comments", methods=["GET"])
def fetch_user_comments(user_id):
    try:
        pipeline = [
            {
                "$match": {
                    "properties.comments.user_id": user_id  
                }
            },
            {
                "$unwind": "$properties.comments"  
            },
            {
                "$match": {
                    "properties.comments.user_id": user_id 
                }
            },
            {
                "$project": {
                    "location_id": "$_id",  
                    "comment": "$properties.comments", 
                    "_id": 0  
                }
            }
        ]
        comments = list(locations.aggregate(pipeline))

        comments_list = []
        for item in comments:
            item['comment']['_id'] = str(item['comment']['_id'])
            item['location_id'] = str(item['location_id'])
            comments_list.append({
                "location_id": item['location_id'],
                "comment_id": item['comment']['_id'],
                "message_content": item['comment']['message_content'],
                "created_at": item['comment']['created_at']
            })

        if not comments_list:
            return make_response(jsonify({'message': 'No comments found for this user'}), 404)
        
        return jsonify(comments_list)
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)


    

##################################################
#############  WIKIPEDIA CONTENT ENDPOINTS + LOGIC
##################################################   

# Use pageid to find wiki content and images

def retrieve_wikiAPI_content(pageid, title):
    base_url = "https://en.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "pageids": pageid,
        "prop": "extracts|pageimages",
        "exintro": "true",
        "explaintext": "true",
        "format": "json",
        "pithumbsize": 500  
    }
    
    response = requests.get(base_url, params=params)
    data = response.json()
    
    page = data.get("query", {}).get("pages", {}).get(str(pageid), {})
    extract = page.get("extract", "Content not found.")
    image_url = page.get("thumbnail", {}).get("source", "")
    
    page_url = f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}"
    
    return {"content": extract, "url": page_url, "image_url": image_url}



# Use longitude and latitude to find locations wiki pages

def wikipedia_geosearch(latitude, longitude, radius=1000):
    base_url = "https://en.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "list": "geosearch",
        "gscoord": f"{latitude}|{longitude}",
        "gsradius": radius,
        "gslimit": "10",  
        "format": "json"
    }
    
    response = requests.get(base_url, params=params)
    data = response.json()

    articles = data.get("query", {}).get("geosearch", [])
    return [{"title": article["title"], "pageid": article["pageid"]} for article in articles]


# Get content and images for a location

@app.route('/api/locations/geosearch', methods=['GET'])
def fetch_location_info():
    latitude = request.args.get('latitude', type=float)
    longitude = request.args.get('longitude', type=float)
    radius = request.args.get('radius', default=100, type=int)
    
    if latitude is None or longitude is None:
        return jsonify({"error": "Latitude and longitude parameters are required."}), 400
    
    articles = wikipedia_geosearch(latitude, longitude, radius)
    if not articles:
        return jsonify({"message": "No nearby Wikipedia articles found."})
    
    first_article = articles[0]
    page_info = retrieve_wikiAPI_content(first_article["pageid"], first_article["title"])
    
    return jsonify({"title": first_article["title"], **page_info})


#Get google location
@app.route("/api/get_location", methods=["GET"])
def get_location():
    google_api_key = "AIzaSyCxGRHPhDu7A4gQU0fRnrYcwf1taC7wg9c"  
    url = f"https://www.googleapis.com/geolocation/v1/geolocate?key={google_api_key}"
    
    response = requests.post(url, json={"considerIp": "true"})
    
    if response.status_code == 200:
        return jsonify(response.json()), 200
    else:
        error_response = response.json()  
        print(error_response) 
        return jsonify(error_response), response.status_code

    

if __name__ == "__main__":
    app.run(debug=True, port=8080)