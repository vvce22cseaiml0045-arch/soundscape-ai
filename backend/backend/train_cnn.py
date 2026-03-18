import os
import librosa
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (
    Conv2D, MaxPooling2D,
    GlobalAveragePooling2D,
    Dense, Dropout
)
from tensorflow.keras.utils import to_categorical
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

# ---------------- PATHS ----------------
DATASET_PATH = "../../data/UrbanSound8K"
CSV_PATH = "../../data/UrbanSound8K/UrbanSound8K.csv"

# ---------------- LOAD CSV ----------------
df = pd.read_csv(CSV_PATH)

X, y = [], []

# ---------------- FEATURE EXTRACTION ----------------
def extract_mel(file_path):
    audio, sr = librosa.load(file_path, sr=22050)
    mel = librosa.feature.melspectrogram(
        y=audio,
        sr=sr,
        n_mels=128,
        n_fft=2048,
        hop_length=512
    )
    mel = librosa.power_to_db(mel, ref=np.max)
    return mel

# ---------------- LOAD DATA ----------------
for _, row in df.iterrows():
    fold = f"fold{row['fold']}"
    path = os.path.join(DATASET_PATH, fold, row["slice_file_name"])

    if not os.path.exists(path):
        continue

    mel = extract_mel(path)
    X.append(mel)
    y.append(row["class"])

# ---------------- PAD BATCH ONLY (NOT MODEL) ----------------
max_len = max(m.shape[1] for m in X)

X_padded = [
    np.pad(m, ((0, 0), (0, max_len - m.shape[1])), mode="constant")
    for m in X
]

X = np.array(X_padded)[..., np.newaxis]

encoder = LabelEncoder()
y_enc = encoder.fit_transform(y)
y_cat = to_categorical(y_enc)

np.save("cnn_classes.npy", encoder.classes_)

X_train, X_test, y_train, y_test = train_test_split(
    X, y_cat, test_size=0.2, random_state=42
)

# ---------------- CNN MODEL (LENGTH-INDEPENDENT) ----------------
model = Sequential([
    Conv2D(32, (3,3), activation="relu", input_shape=(128, None, 1)),
    MaxPooling2D(2,2),

    Conv2D(64, (3,3), activation="relu"),
    MaxPooling2D(2,2),

    Conv2D(128, (3,3), activation="relu"),
    MaxPooling2D(2,2),

    GlobalAveragePooling2D(),   # 🔥 KEY FIX
    Dense(128, activation="relu"),
    Dropout(0.5),
    Dense(len(encoder.classes_), activation="softmax")
])

model.compile(
    optimizer="adam",
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

print("🚀 Training CNN...")
model.fit(
    X_train,
    y_train,
    epochs=15,
    batch_size=32,
    validation_data=(X_test, y_test)
)

model.save("cnn_noise_model.h5")
print("✅ CNN model saved")
