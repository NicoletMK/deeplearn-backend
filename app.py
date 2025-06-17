from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import uuid
import shutil
import subprocess
import os
import time

app = Flask(__name__)

# Proper CORS setup to allow Vercel frontend
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:5173",
    "https://deeplearn-frontend.vercel.app"
]}}, supports_credentials=True)

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

# Auto-cleanup for output files older than an hour (3600s)
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
        image_filename = request.form.get('imageFileName')
        source_video = request.form.get('sourceVideo')

        if not image_filename or not source_video:
            return jsonify({'error': 'Missing imageFileName or sourceVideo'}), 400

        session_id = str(uuid.uuid4())
        img_path = os.path.join('public', 'characters', image_filename)
        video_path = os.path.join('public', 'videos', 'creator', source_video)
        output_path = os.path.join('output', f"{session_id}.mp4")

        print(f"🧠 image_filename: {image_filename}")
        print(f"🧠 source_video: {source_video}")
        print(f"🧠 img_path: {img_path}")
        print(f"🧠 video_path: {video_path}")
        print(f"✅ img exists: {os.path.exists(img_path)}")
        print(f"✅ video exists: {os.path.exists(video_path)}")


        if not os.path.exists(img_path):
            return jsonify({'error': f"Image not found: {img_path}"}), 400
        if not os.path.exists(video_path):
            return jsonify({'error': f"Video not found: {video_path}"}), 400

        os.makedirs('output', exist_ok=True)
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

        return send_file(output_path, mimetype='video/mp4', as_attachment=True, download_name='deepfake_output.mp4')

    except subprocess.CalledProcessError as err:
        return jsonify({'error': f"SimSwap failed: {err}"}), 500
    except Exception as e:
        print(f"❌ Deepfake generation failed: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/welcome', methods=['POST'])
def save_welcome_data():
    try:
        data = request.json
        print("📥 Received welcome data:", data)
        return jsonify({"status": "ok"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health')
def health():
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=True)
