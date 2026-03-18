from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client.soundscape_ai

users = db.users
predictions = db.predictions
