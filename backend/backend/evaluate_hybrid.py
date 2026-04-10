import os
import pandas as pd
import numpy as np
import librosa
import joblib
import tensorflow as tf
from sklearn.model_selection import train_test_split

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2' # Suppress TF warnings

from ml.feature_extraction import extract_features

# ---------------- PATHS ----------------
DATASET_PATH = "../../data/UrbanSound8K"
CSV_PATH = "../../data/UrbanSound8K/UrbanSound8K.csv"

# ---------------- LOAD MODELS ----------------
print("Loading saved models...")
try:
    ml_model = joblib.load("model/noise_model.pkl")
    encoder = joblib.load("model/label_encoder.pkl")
    cnn_model = tf.keras.models.load_model("model/cnn_noise_model.h5")
    cnn_classes = np.load("model/cnn_classes.npy", allow_pickle=True)
except Exception as e:
    print(f"Error loading models. Make sure they are trained first. ({e})")
    exit(1)

# ---------------- HELPER FOR CNN ----------------
def extract_mel_cnn(file_path):
    # This exactly mimics app.py's prediction logic
    audio, sr = librosa.load(file_path, sr=22050)
    mel = librosa.feature.melspectrogram(
        y=audio, sr=sr, n_mels=128, n_fft=2048, hop_length=512, fmax=8000
    )
    mel = librosa.power_to_db(mel, ref=np.max)
    
    TRAINING_WIDTH = 280
    if mel.shape[1] < TRAINING_WIDTH:
        mel = np.pad(mel, ((0, 0), (0, TRAINING_WIDTH - mel.shape[1])), mode="constant")
    else:
        mel = mel[:, :TRAINING_WIDTH]
        
    return mel.reshape(1, 128, TRAINING_WIDTH, 1)

# ---------------- PREPARE DATA ----------------
print("Reading dataset metadata...")
df = pd.read_csv(CSV_PATH)

valid_rows = []
for idx, row in df.iterrows():
    fold = f"fold{row['fold']}"
    path = os.path.join(DATASET_PATH, fold, row["slice_file_name"])
    if os.path.exists(path):
        valid_rows.append(row)

valid_df = pd.DataFrame(valid_rows)

# Create a test split (simulating a 30% unseen dataset)
_, test_df = train_test_split(valid_df, test_size=0.3, random_state=42)

# For evaluation speed, default test on a random sample of 200 files
LIMIT = 200 
eval_df = test_df.sample(n=min(LIMIT, len(test_df)), random_state=42)

correct_hybrid = 0
correct_cnn = 0
correct_ml = 0
total = 0

for idx, row in eval_df.iterrows():
    fold = f"fold{row['fold']}"
    path = os.path.join(DATASET_PATH, fold, row["slice_file_name"])
    true_label = str(row["class"])
    
    # 1. ML Model Prediction
    features = extract_features(path)
    if features is None:
        continue
    ml_pred_encoded = ml_model.predict([features])[0]
    ml_pred = str(encoder.inverse_transform([ml_pred_encoded])[0])
    
    # 2. CNN Model Prediction
    X_cnn = extract_mel_cnn(path)
    cnn_preds = cnn_model.predict(X_cnn, verbose=0)
    cnn_idx = np.argmax(cnn_preds)
    cnn_pred = str(cnn_classes[cnn_idx])
    cnn_conf = float(np.max(cnn_preds))
    
    # 3. Apply Hybrid Fallback Logic (>= 0.70 confidence)
    if cnn_conf >= 0.70:
        hybrid_pred = cnn_pred
    else:
        hybrid_pred = ml_pred
        
    # 4. Compare with Ground Truth
    if hybrid_pred == true_label: correct_hybrid += 1
    if cnn_pred == true_label:    correct_cnn += 1
    if ml_pred == true_label:     correct_ml += 1
        
    total += 1
    if total % 20 == 0:
        print(f"Processed {total}/{len(eval_df)} files...")

print(f"HYBRID Accuracy:  {(correct_hybrid / total) * 100:.2f}%")

