from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import jwt
import datetime
from functools import wraps

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

OLLAMA_URL = "http://localhost:11434/api/generate"
JWT_SECRET = "your-secret-key"  # In production, use environment variable



def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        try:
            token = token.replace('Bearer ', '')
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            current_user = data['user']
        except:
            return jsonify({'error': 'Token is invalid'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'error': 'Username, email, and password are required'}), 400

    # Check if user already exists
    existing_user = users_collection.find_one({'email': email})
    if existing_user:
        return jsonify({'error': 'User already exists'}), 400

    # Insert new user
    user_doc = {
        'username': username,
        'email': email,
        'password': password,  # In production, hash the password
        'created_at': datetime.datetime.utcnow()
    }
    users_collection.insert_one(user_doc)
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Query user from MongoDB
    user = users_collection.find_one({'email': email})
    if not user or user['password'] != password:
        return jsonify({'error': 'Invalid credentials'}), 401

    token = jwt.encode({
        'user': email,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, JWT_SECRET, algorithm="HS256")

    return jsonify({'token': token, 'username': user['username']}), 200

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        user_email = data.get('user_email', 'anonymous')  # Optional user identification

        if not user_message:
            return jsonify({'error': 'No message provided'}), 400

        # Prepare payload for Ollama
        payload = {
            "model": "mistral:latest",
            "prompt": user_message,
            "stream": False
        }

        # Send request to Ollama
        response = requests.post(OLLAMA_URL, json=payload, timeout=30)

        if response.status_code == 200:
            result = response.json()
            bot_response = result.get('response', 'Sorry, I could not generate a response.')

            # Store chat message in MongoDB
            chat_doc = {
                'user_email': user_email,
                'user_message': user_message,
                'bot_response': bot_response,
                'timestamp': datetime.datetime.utcnow()
            }
            chat_history_collection.insert_one(chat_doc)

            return jsonify({'response': bot_response})
        else:
            return jsonify({'error': 'Failed to get response from Ollama'}), 500

    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Error communicating with Ollama: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
