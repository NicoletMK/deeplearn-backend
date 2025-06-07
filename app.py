from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import shutil
import subprocess
import uuid
import threading
import time
import json

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'static'
DATA_FOLDER = 'data'

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
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
    print(f"🟡 Saving to {path}")
    print(f"🟢 New entry: {new_entry}")
    
    # Create the file if it doesn't exist
    if not os.path.exists(path):
        print("🆕 File does not exist, creating new file...")
        with open(path, 'w') as f:
            json.dump([], f)

    try:
        with open(path, 'r') as f:
            data = json.load(f)
        print(f"📂 Existing data: {data}")

        data.append(new_entry)

        with open(path, 'w') as f:
            json.dump(data, f, indent=2)
        print("✅ Data saved successfully.")
    except Exception as e:
        print(f"❌ Error while saving data: {e}")



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

@app.route('/generate', methods=['POST'])
def generate_video():
    image = request.files.get('image')
    audio = request.files.get('audio')

    if not image or not audio:
        return jsonify({'error': 'Missing image or audio file'}), 400

    session_id = str(uuid.uuid4())
    image_path = os.path.join(UPLOAD_FOLDER, f'{session_id}_input.jpg')
    raw_audio_path = os.path.join(UPLOAD_FOLDER, f'{session_id}_raw.mp3')
    audio_path = os.path.join(UPLOAD_FOLDER, f'{session_id}_input.wav')
    output_path = os.path.join(OUTPUT_FOLDER, f'{session_id}_generated.mp4')

    image.save(image_path)
    audio.save(raw_audio_path)

    os.system(f"ffmpeg -y -i {raw_audio_path} -ar 16000 -ac 1 -vn {audio_path}")

    try:
        subprocess.run([
            'python3', 'Wav2Lip/inference.py',
            '--checkpoint_path', 'Wav2Lip/wav2lip.pth',
            '--face', image_path,
            '--audio', audio_path,
            '--outfile', output_path
        ], check=True)
    except subprocess.CalledProcessError as e:
        print("Wav2Lip failed:", e)
        return jsonify({'error': 'Deepfake generation failed'}), 500

    return jsonify({'videoUrl': f'http://localhost:5050/static/{os.path.basename(output_path)}'}), 200

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory(OUTPUT_FOLDER, filename)

def cleanup_old_files(folder, age_seconds=120):
    while True:
        now = time.time()
        for filename in os.listdir(folder):
            path = os.path.join(folder, filename)
            if os.path.isfile(path) and now - os.path.getmtime(path) > age_seconds:
                try:
                    os.remove(path)
                except Exception as e:
                    print(f"Failed to delete {path}: {e}")
        time.sleep(300)

threading.Thread(target=cleanup_old_files, args=(UPLOAD_FOLDER,), daemon=True).start()
threading.Thread(target=cleanup_old_files, args=(OUTPUT_FOLDER,), daemon=True).start()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=True)
