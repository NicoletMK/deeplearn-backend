from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import uuid
import shutil
import subprocess
import os
import time

# Initialize Flask app
app = Flask(__name__)
CORS(app, supports_credentials=True, origins=[
    "http://localhost:5173",
    "https://deeplearn-frontend.vercel.app"
])

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
        image_file_name = request.form['imageFileName']
        source_video = request.form['sourceVideo']

        session_id = str(uuid.uuid4())
        img_path = f"SimSwap/examples/{session_id}.jpg"
        original_img_path = f"public/characters/{image_file_name}"
        video_path = f"public/videos/creator/{source_video}"
        output_path = f"output/{session_id}.mp4"

        # Validate source files exist
        if not os.path.exists(original_img_path):
            return jsonify({'error': f"Image file not found: {original_img_path}"}), 400
        if not os.path.exists(video_path):
            return jsonify({'error': f"Video file not found: {video_path}"}), 400

        os.makedirs('output', exist_ok=True)

        # Copy image to SimSwap input path
        shutil.copyfile(original_img_path, img_path)
        print(f"📥 Copied image from {original_img_path} to {img_path}")

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
        print(f"❌ SimSwap process failed: {err}")
        return jsonify({'error': f"SimSwap failed: {err}"}), 500
    except Exception as e:
        print(f"❌ Deepfake generation failed: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health')
def health():
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=True)
