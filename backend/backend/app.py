from fastapi import FastAPI, UploadFile, File, Form,HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib, os, hashlib, base64, sys
import librosa, librosa.display
import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf
from io import BytesIO
from datetime import datetime
import librosa.display


from ml.feature_extraction import extract_features
from db import users, predictions
from cnn.gradcam import generate_gradcam

# ---------------- PATH SETUP ----------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

# ---------------- APP INIT ----------------
app = FastAPI(title="Soundscape AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- LOAD ML MODEL ----------------
ml_model = joblib.load("model/noise_model.pkl")
encoder = joblib.load("model/label_encoder.pkl")

# ---------------- LOAD CNN MODEL ----------------
cnn_model = tf.keras.models.load_model("model/cnn_noise_model.h5")
cnn_classes = np.load("model/cnn_classes.npy", allow_pickle=True)
print("CNN INPUT SHAPE:", cnn_model.input_shape)
print("CNN input shape:", cnn_model.input_shape)
print("CNN output shape:", cnn_model.output_shape)
# 🔥 FORCE BUILD THE MODEL
dummy_input = tf.zeros((1, 128, 280, 1))   # use your training width
cnn_model(dummy_input)
print(cnn_model.input_shape)

# ---------------- ACCURACY VALUES ----------------
ML_ACCURACY = 89.87
CNN_ACCURACY = 88.36
HYBRID_ACCURACY = 86.5
 
# ---------------- CONSTANTS ----------------
NOISE_LEVEL = {
    "air_conditioner": "Low",
    "children_playing": "Medium",
    "dog_bark": "Medium",
    "street_music": "Medium",
    "car_horn": "High",
    "siren": "High",
    "gun_shot": "High",
    "drilling": "High",
    "engine_idling": "Medium",
    "jackhammer": "High"
}

NOISE_MESSAGE = {
    "Low": "✅ Safe environment",
    "Medium": "⚠ Moderate noise exposure",
    "High": "🚨 High noise – avoid area"
}

# ---------------- UTILITY ----------------
def fig_to_base64():
    buf = BytesIO()
    plt.savefig(buf, format="png", bbox_inches="tight")
    plt.close()
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")


def calculate_decibel(y):
    rms = float(np.sqrt(np.mean(y**2)))
    db = 20 * np.log10(rms + 1e-6)
    return float(round(db, 2))

# ---------------- AUTH ----------------

@app.get("/")
def root():
    return {"message": "Soundscape AI Backend Running"}

@app.post("/register")
def register(email: str = Form(...), password: str = Form(...)):
    if users.find_one({"email": email}):
        return {"success": False, "message": "User already exists"}
    hashed = hashlib.sha256(password.encode()).hexdigest()
    users.insert_one({"email": email, "password": hashed})
    return {"success": True}

@app.post("/login")
def login(email: str = Form(...), password: str = Form(...)):
    hashed = hashlib.sha256(password.encode()).hexdigest()
    user = users.find_one({"email": email, "password": hashed})
    if user:
        return {"success": True, "message": "Login successful"}
    else:
        # Debug: Check if user exists at all
        user_exists = users.find_one({"email": email})
        if user_exists:
            return {"success": False, "message": "Invalid password"}
        else:
            return {"success": False, "message": "User not found"}

# ---------------- ML PREDICTION ----------------
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    temp = f"temp_{file.filename}"

    with open(temp, "wb") as f:
        f.write(await file.read())

    features = extract_features(temp)
    pred = ml_model.predict([features])[0]
    pred_proba = ml_model.predict_proba([features])[0]
    confidence = round(float(np.max(pred_proba)) * 100, 2)
    noise_type = str(encoder.inverse_transform([pred])[0])

    level = NOISE_LEVEL.get(noise_type, "Unknown")
    message = NOISE_MESSAGE.get(level, "N/A")

    y, sr = librosa.load(temp)
    decibel = calculate_decibel(y)

    plt.figure(figsize=(5, 3))
    spec = librosa.amplitude_to_db(np.abs(librosa.stft(y)))
    librosa.display.specshow(spec, sr=sr, x_axis="time", y_axis="log")
    plt.colorbar()
    plt.tight_layout()
    spectrogram = fig_to_base64()

    plt.figure(figsize=(5, 3))
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    librosa.display.specshow(mfcc, x_axis="time")
    plt.colorbar()
    plt.tight_layout()
    mfcc_img = fig_to_base64()

    os.remove(temp)

    predictions.insert_one({
        "noise_type": noise_type,
        "noise_level": level,
        "created_at": datetime.now()
    })

    return {
        "model": "ML",
        "noise_type": noise_type,
        "noise_level": level,
        "message": message,
        "confidence": confidence,
        "accuracy": ML_ACCURACY,
        "decibel": decibel,
        "spectrogram": spectrogram,
        "mfcc": mfcc_img
    }

# ---------------- DEBUG: View registered users ----------------
@app.get("/debug/users")
def debug_users():
    try:
        # Get all users from MongoDB
        user_list = []
        cursor = users.find({})
        
        for user in cursor:
            user_data = {
                "_id": str(user["_id"]),
                "email": user.get("email", "No email"),
                "created_at": user.get("created_at", "Not set"),
                "password_hash_preview": user.get("password", "No password")[:10] + "..." if user.get("password") else "No password"
            }
            user_list.append(user_data)
        
        return {
            "success": True,
            "users": user_list, 
            "count": len(user_list),
            "database": "soundscape_ai",
            "collection": "users"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "users": [],
            "count": 0
        }

# ---------------- DEBUG: Test MongoDB connection ----------------
@app.get("/debug/db-status")
def debug_db_status():
    try:
        # Test database connection
        db_stats = db.command("dbstats")
        collections = db.list_collection_names()
        
        # Count documents in each collection
        collection_counts = {}
        for collection_name in collections:
            collection_counts[collection_name] = db[collection_name].count_documents({})
        
        return {
            "success": True,
            "database_name": db.name,
            "collections": collections,
            "collection_counts": collection_counts,
            "db_size": db_stats.get("dataSize", 0)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# ---------------- CNN HELPER ----------------
def predict_cnn_file(audio_path: str):
    y, sr = librosa.load(audio_path, sr=22050)

    mel = librosa.feature.melspectrogram(
        y=y,
        sr=sr,
        n_mels=128,
        n_fft=2048,
        hop_length=512,
        fmax=8000
    )

    mel_db = librosa.power_to_db(mel, ref=np.max)

    TRAINING_WIDTH = 280

    if mel_db.shape[1] < TRAINING_WIDTH:
        mel_db = np.pad(
            mel_db,
            ((0, 0), (0, TRAINING_WIDTH - mel_db.shape[1])),
            mode="constant"
        )
    else:
        mel_db = mel_db[:, :TRAINING_WIDTH]

    X = mel_db.reshape(1, 128, TRAINING_WIDTH, 1)

    preds = cnn_model.predict(X, verbose=0)
    idx = np.argmax(preds)

    return str(cnn_classes[idx]), float(np.max(preds))

# ---------------- CNN API ----------------
@app.post("/predict_cnn")
async def predict_cnn(file: UploadFile = File(...)):
    try:
        file_path = f"temp_{file.filename}"
        with open(file_path, "wb") as f:
            f.write(await file.read())

        y, sr = librosa.load(file_path, sr=22050)
        decibel = calculate_decibel(y)


        mel = librosa.feature.melspectrogram(
            y=y,
            sr=sr,
            n_mels=128,
            n_fft=2048,
            hop_length=512,
            fmax=8000
        )

        mel = librosa.power_to_db(mel, ref=np.max)

        TRAINING_WIDTH = 280

        if mel.shape[1] < TRAINING_WIDTH:
            mel = np.pad(
                mel,
                ((0, 0), (0, TRAINING_WIDTH - mel.shape[1])),
                mode="constant"
            )
        else:
            mel = mel[:, :TRAINING_WIDTH]

        X = mel.reshape(1, 128, TRAINING_WIDTH, 1)

        preds = cnn_model.predict(X, verbose=0)
        idx = int(np.argmax(preds))
        confidence = float(np.max(preds)) * 100

        noise_type = str(cnn_classes[idx])
        noise_level = NOISE_LEVEL.get(noise_type, "Medium")
        message = NOISE_MESSAGE.get(noise_level, "Noise impact not estimated")

        # Generate spectrogram and MFCC images
        plt.figure(figsize=(5, 3))
        spec = librosa.amplitude_to_db(np.abs(librosa.stft(y)))
        librosa.display.specshow(spec, sr=sr, x_axis="time", y_axis="log")
        plt.colorbar()
        plt.tight_layout()
        spectrogram = fig_to_base64()

        plt.figure(figsize=(5, 3))
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        librosa.display.specshow(mfcc, x_axis="time")
        plt.colorbar()
        plt.tight_layout()
        mfcc_img = fig_to_base64()

        os.remove(file_path)

        return {
            "model": "CNN",
            "noise_type": noise_type,
            "noise_level": noise_level,
            "message": message,
            "confidence": round(confidence, 2),
            "decibel": decibel,
            "spectrogram": spectrogram,
            "mfcc": mfcc_img
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------- HYBRID API ----------------
@app.post("/predict_hybrid")
async def predict_hybrid(file: UploadFile = File(...)):
    temp = f"temp_{file.filename}"
    with open(temp, "wb") as f:
        f.write(await file.read())

    # Load audio ONCE
    y, sr = librosa.load(temp, sr=22050)
    decibel = calculate_decibel(y)

    # -------- ML --------
    features = extract_features(temp)
    ml_pred = ml_model.predict([features])[0]
    ml_label = str(encoder.inverse_transform([ml_pred])[0])
    ml_level = NOISE_LEVEL.get(ml_label, "Unknown")

    # -------- CNN --------
    cnn_label, cnn_conf = predict_cnn_file(temp)

    # -------- GradCAM --------
    try:
        gradcam = generate_gradcam(temp)
    except Exception as e:
        print("GradCAM failed:", e)
        gradcam = None

    # -------- Decision Logic --------
    if cnn_conf >= 0.70:
        final_model = "CNN"
        final_prediction = cnn_label
        final_confidence = round(cnn_conf * 100, 2)
    else:
        final_model = "ML"
        final_prediction = ml_label
        final_confidence = ML_ACCURACY

    # Generate spectrogram and MFCC images
    plt.figure(figsize=(5, 3))
    spec = librosa.amplitude_to_db(np.abs(librosa.stft(y)))
    librosa.display.specshow(spec, sr=sr, x_axis="time", y_axis="log")
    plt.colorbar()
    plt.tight_layout()
    spectrogram = fig_to_base64()

    plt.figure(figsize=(5, 3))
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    librosa.display.specshow(mfcc, x_axis="time")
    plt.colorbar()
    plt.tight_layout()
    mfcc_img = fig_to_base64()

    os.remove(temp)

    return {
        "final_model": final_model,
        "final_prediction": str(final_prediction),
        "confidence": float(final_confidence),
        "decibel": decibel,   # ✅ NOW SAFE
        "spectrogram": spectrogram,
        "mfcc": mfcc_img,
        "ml_result": {
            "prediction": str(ml_label),
            "noise_level": ml_level,
            "accuracy": float(ML_ACCURACY),
            "decibel": decibel
        },
        "cnn_result": {
            "prediction": str(cnn_label),
            "confidence": round(float(cnn_conf) * 100, 2),
            "decibel": decibel
        },
        "gradcam": gradcam if final_model == "CNN" else None
    }


# ---------------- ACCURACY ----------------
@app.get("/accuracy-comparison")
def accuracy_comparison():
    return {
        "models": ["ML", "CNN", "Hybrid"],
        "accuracies": [ML_ACCURACY, CNN_ACCURACY, HYBRID_ACCURACY]
    }

@app.get("/accuracy-graph")
def accuracy_graph():
    models = ["ML", "CNN", "Hybrid"]
    accuracies = [ML_ACCURACY, CNN_ACCURACY, HYBRID_ACCURACY]

    plt.figure(figsize=(6, 4))
    plt.bar(models, accuracies)
    plt.ylim(0, 100)
    plt.ylabel("Accuracy (%)")
    plt.title("Accuracy Comparison")

    img = fig_to_base64()
    return {"graph": img}

# ---------------- STATS ----------------
@app.get("/stats")
def stats():
    levels = list(predictions.aggregate([
        {"$group": {"_id": "$noise_level", "count": {"$sum": 1}}}
    ]))
    types = list(predictions.aggregate([
        {"$group": {"_id": "$noise_type", "count": {"$sum": 1}}}
    ]))
    return {"levels": levels, "types": types}

# ---------------- HISTORY ----------------
@app.get("/history")
def history():
    return list(
        predictions.find({}, {"_id": 0}).sort("created_at", -1)
    )

