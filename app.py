from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import uuid
import subprocess
import os
import time
import json

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=[
    "http://localhost:5173",
    "https://deeplearn-frontend.vercel.app"
])

DATA_FOLDER = "data"
os.makedirs(DATA_FOLDER, exist_ok=True)

data_files = {
    'pre-survey': os.path.join(DATA_FOLDER, 'preSurveyData.json'),
    'detective': os.path.join(DATA_FOLDER, 'detectiveData.json'),
    'ethics': os.path.join(DATA_FOLDER, 'ethicsData.json'),
    'post-survey': os.path.join(DATA_FOLDER, 'postSurveyData.json'),
    'welcome': os.path.join(DATA_FOLDER, 'welcomeData.json')
}

def save_to_json(file_path, payload):
    try:
        data = []
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                data = json.load(f)
        data.append(payload)
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        print(f"❌ Failed to save to {file_path}: {e}")
        return False

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin') or '*'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response

@app.route('/api/welcome', methods=['POST'])
def save_welcome():
    payload = request.get_json()
    success = save_to_json(data_files['welcome'], payload)
    return jsonify({'status': 'ok' if success else 'error'}), 200 if success else 500

@app.route('/api/detective', methods=['POST'])
def save_detective():
    payload = request.get_json()
    success = save_to_json(data_files['detective'], payload)
    return jsonify({'status': 'ok' if success else 'error'}), 200 if success else 500

@app.route('/api/ethics', methods=['POST'])
def save_ethics():
    payload = request.get_json()
    success = save_to_json(data_files['ethics'], payload)
    return jsonify({'status': 'ok' if success else 'error'}), 200 if success else 500

@app.route('/api/pre-survey', methods=['POST'])
def save_pre_survey():
    payload = request.get_json()
    success = save_to_json(data_files['pre-survey'], payload)
    return jsonify({'status': 'ok' if success else 'error'}), 200 if success else 500

@app.route('/api/post-survey', methods=['POST'])
def save_post_survey():
    payload = request.get_json()
    success = save_to_json(data_files['post-survey'], payload)
    return jsonify({'status': 'ok' if success else 'error'}), 200 if success else 500

def cleanup_output_dir(threshold_seconds=3600):
    now = time.time()
    output_folder = 'output'
    for f in os.listdir(output_folder):
        fpath = os.path.join(output_folder, f)
        if os.path.isfile(fpath) and now - os.path.getmtime(fpath) > threshold_seconds:
            try:
                os.remove(fpath)
                print(f"🧹 Removed old file: {fpath}")
            except Exception as e:
                print(f"⚠️ Failed to delete {fpath}: {e}")

@app.route('/create-deepfake', methods=['POST'])
def create_deepfake():
    try:
        image_file = request.files['image']
        source_video = request.form['sourceVideo']

        session_id = str(uuid.uuid4())
        img_path = f"SimSwap/examples/{session_id}.jpg"
        video_path = f"source_videos/{source_video}"
        output_path = f"output/{session_id}.mp4"

        os.makedirs('output', exist_ok=True)
        image_file.save(img_path)
        print(f"📥 Saved image to {img_path}")

        cleanup_output_dir()

        command = [
            "python", "SimSwap/test_video_swapsingle.py",
            "--isTrain", "false",
            "--name", "people",
            "--Arc_path", "SimSwap/arcface_model/arcface_checkpoint.tar",
            "--pic_a_path", img_path,
            "--video_path", video_path,
            "--output_path", output_path
        ]

        print("🚀 Running SimSwap...")
        subprocess.run(command, check=True)
        print(f"✅ Video created at {output_path}")

        if os.path.exists(img_path):
            os.remove(img_path)
            print(f"🗑️ Deleted temporary image: {img_path}")

        return send_file(output_path, mimetype='video/mp4', as_attachment=True, download_name='deepfake_output.mp4')

    except subprocess.CalledProcessError as err:
        return jsonify({'error': f"SimSwap failed: {err}"}), 500
    except Exception as e:
        print(f"❌ Deepfake generation failed: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health')
def health():
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=True)
