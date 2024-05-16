import os
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from pymongo import MongoClient
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import json

# Load environment variables from .env file
load_dotenv()

# Retrieve API keys and URLs from environment variables
API_KEY = os.getenv('API_KEY')
MONGO_URL = os.getenv('MONGO_URL')

# Connect to MongoDB
mongo_client = MongoClient(MONGO_URL)
db = mongo_client.test
collection = db['places']

# Initialize LangChain OpenAI client
openai_client = ChatOpenAI(api_key=API_KEY)

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB
# Function to convert MongoDB documents to JSON-serializable format


def convert_document(doc):
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])
    if 'imagePlace' in doc and isinstance(doc['imagePlace'], list):
        doc['imagePlace'] = [str(image) for image in doc['imagePlace']]
    return doc


@app.route('/api/generate_itinerary', methods=['POST'])
def generate_itinerary():
    try:
        # Extract context values from the request body
        selectedRegion = request.json.get('selectedRegion')
        budget = request.json.get('budget')
        days = request.json.get('days')
        groupSize = request.json.get('groupSize')
        favouriteActivities = request.json.get('favouriteActivities')

        # Fetch all documents from the collection that match the selected regions
        documents_cursor = collection.find(
            {"region": {"$in": selectedRegion}},
            {
                "name": 1,
                "category": 1,
                "description": 1,
                "imagePlace": {"$slice": 1},
                "rate": 1,
                "duration": 1,
                "priceRange": 1,
                "region": 1,
                "googleLocation": 1,
                "_id": 1
            }
        )

        documents = list(documents_cursor)

        # Convert documents to JSON-serializable format
        places_data = [convert_document(doc) for doc in documents]

        # Generate the days' details dynamically
        days_details = []
        for day in range(1, days + 1):
            day_detail = {
                "title": f"Day {day}",
                "description": "A day full of activities from your favorite list.",
                "places": []  # This will be filled by the model
            }
            days_details.append(day_detail)

        # Define the prompt template
        prompt_template = """
        you are an AI trip generator, and your goal is to create the best itinerary for the user based on the database. Moreover, when you fetch data from MongoDB, do not change the format values of keys or values your objective is to return a JSON file with the following instructions:
        Generate a detailed itinerary for a {days}-day trip to {selectedRegion} with a budget of {budget} and a group size of {groupSize}. Each day should feature activities from the following favorite activities: {favouriteActivities}. If you don't find exact matches, try to find alternatives with a similar activities from the database only.

        The itinerary should span multiple days. Here is the structured data:

        {{
            "trip": {{
                "title": "Exploring {selectedRegion}",
                "description": "A {days}-day adventure across various regions.",
                "days": {days_details}
            }}
        }}

        Based on the following places data, select the best places for each day to create a well-balanced itinerary. Ensure all data is valid, correct, and follows the structure of the collection from the MongoDB database. Be careful not to generate places that are outside the scope of this array [all data must alghin with the data from the MongoDB database]:

        {places}

        Please use only the data provided. Do not introduce any unknown data or place names outside the scope of given array of places. Each place must include the following:

        {{
            "_id": "objectID of the place from above",
            "category": "thingsToDo" | "thingsToEat" | "placesToStay",
            "name": "Place Name",
            "description": "Detailed description of the place.",
            "imagePlace": "URL or path to the image",
            "rate": Rating out of 5,
            "duration": "Expected duration of visit",
            "priceRange": "Cost range",
            "region": "Region name",
            "googleLocation": {{
                "lat": Latitude,
                "lng": Longitude
            }}
        }}
        the values for this template are for explination purposes only, you should replace them with the actual values from the places base on the requested features.
        If there are no places that match the selected favorite activities, use any other available places in the collection places. Also, try to include a variety of places each day from different categories such as thingsToDo, thingsToEat, and placesToStay.
        Remember, you are an AI trip generator, and your goal is to create the best itinerary for the user based on the database. Moreover, when you fetch data from MongoDB, do not change the format values of keys.
        """

        # Format the prompt text
        prompt_text = prompt_template.format(
            selectedRegion=selectedRegion,
            budget=budget,
            days=days,
            groupSize=groupSize,
            favouriteActivities=favouriteActivities,
            days_details=json.dumps(days_details),
            places=json.dumps(places_data)
        )

        print("The following is the prompt text that will enter to the AI:", prompt_text)

        # Custom JSON parser function
        def parse_json_response(response):
            try:
                return json.loads(response)
            except json.JSONDecodeError:
                return {"error": "Failed to parse JSON response from the model."}

        # Generate the itinerary using OpenAI
        response = openai_client.invoke(
            prompt_text,
            model="gpt-3.5-turbo",  # Reduce the max_tokens to manage the length
            temperature=0.5,
            top_p=0.9,
            n=1,
            stream=False,
            stop=None,
            presence_penalty=0,
            frequency_penalty=0
        )

        # Print the raw response for debugging

        raw_response = response.content
        parsed_response = parse_json_response(raw_response)

    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        parsed_response = {"error": str(e)}

    return jsonify(parsed_response), 200


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
