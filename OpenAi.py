import json
import os
from openai import OpenAI
from env import API_KEY, MONGO_URL
from pymongo import MongoClient
from flask import Flask, request, jsonify
from flask_cors import CORS

# Connect to MongoDB + OpenAI
openai_client = OpenAI(api_key=API_KEY)
mongo_client = MongoClient(MONGO_URL)
db = mongo_client.test
collection = db['places']

app = Flask(__name__)
CORS(app, supports_credentials=True)

@app.route('/api/generate_itinerary', methods=['POST'])
def generate_itinerary():
    # Extract context values from the request body
    selectedRegion = request.json.get('selectedRegion')
    budget = request.json.get('budget')
    days = request.json.get('days')
    groupSize = request.json.get('groupSize')
    favouriteActivities = request.json.get('favouriteActivities')

    # Fetch all documents from the collection
    documents = collection.find()

    # Generate days for the trip
    days_data = []
    for i in range(days):
        # Generate places for the day
        places = []
        for document in documents:
            place = {
                "category": document.get('category', 'N/A'),
                "name": document['name'],
                "description": document.get('description', 'No description provided'),
                "imagePlace": document['imagePlace'][0] if document.get('imagePlace') else '',
                "rate": document.get('rate', 0),
                "duration": document.get('duration', 'N/A'),
                "priceRange": document.get('priceRange', 'N/A'),
                "region": document['region'],
                "googleLocation": {
                    "lat": document['googleLocation']['lat'] if 'googleLocation' in document and 'lat' in document['googleLocation'] else 'N/A',
                    "lng": document['googleLocation']['lng'] if 'googleLocation' in document and 'lng' in document['googleLocation'] else 'N/A'
                }
            }
            places.append(place)
    
        day = {
            "title": f"Day {i+1}",
            "description": f"This is a description for Day {i+1}",
            "places": places
        }
        days_data.append(day)
    
    # Generate a single user prompt with all the places
    user_prompt = f"""
        Generate a detailed itinerary for a {days}-day trip to {selectedRegion} in Bahrain, with a budget of {budget} and a group size of {groupSize}. Each day should feature three distinct activities from these favourite activities: {favouriteActivities}. The itinerary should span multiple days.
        Follow this example:
        {{
            "trip": {{
                "title": "Exploring {selectedRegion} of Bahrain",
                "description": "A {days}-day adventure across various regions of Bahrain.",
                "days": {days_data}
            }}
        }}
        """

    # Send the user prompt to the OpenAI API
    try:
        chat_completion, *_ = openai_client.chat.completions.create(
                messages=[
                        {"role": "system", "content": "Please output valid JSON and utilize only data that exists within the documents in the provided MongoDB collection."},
                        {"role": "user", "content": user_prompt},
                ],
                model="gpt-3.5-turbo",
                response_format={"type": "json_object"},
                temperature=0.5,
        ).choices
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")

    content = chat_completion.message.content
    reply = json.loads(content)
    print(content)

    return jsonify(reply), 200

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)