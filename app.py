from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=[
    "http://localhost:5173",
    "https://deeplearn-frontend.vercel.app"
])

DATA_FOLDER = 'data'
os.makedirs(DATA_FOLDER, exist_ok=True)

data_files = {
    'pre-survey': os.path.join(DATA_FOLDER, 'preSurveyData.json'),
    'detective': os.path.join(DATA_FOLDER, 'detectiveData.json'),
    'ethics': os.path.join(DATA_FOLDER, 'ethicsData.json'),
    'post-survey': os.path.join(DATA_FOLDER, 'postSurveyData.json'),
    'welcome': os.path.join(DATA_FOLDER, 'welcomeData.json')
}

def save_data(file_key, new_entry):
    path = data_files[file_key]
    if not os.path.exists(path):
        with open(path, 'w') as f:
            json.dump([], f)

    try:
        with open(path, 'r') as f:
            data = json.load(f)
        data.append(new_entry)
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"❌ Error saving data: {e}")

@app.route('/api/<form_type>', methods=['POST'])
def collect_form_data(form_type):
    if form_type not in data_files:
        return jsonify({'error': 'Invalid form type'}), 400
    try:
        entry = request.get_json()
        save_data(form_type, entry)
        return jsonify({'message': 'Saved'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200

@app.route('/deeplearn-generate', methods=['POST'])
def deprecated():
    return jsonify({'error': 'This endpoint is deprecated and no longer supported.'}), 410

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=True)
