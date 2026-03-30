import os
import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

from ml.feature_extraction import extract_features

DATASET_PATH = "../../data/UrbanSound8K"
CSV_PATH = "../../data/UrbanSound8K/UrbanSound8K.csv"


# Load metadata
df = pd.read_csv(CSV_PATH)

X = []
y = []

print("Extracting features...")

for index, row in df.iterrows():
    fold = f"fold{row['fold']}"
    file_name = row['slice_file_name']
    class_label = row['class']

    file_path = os.path.join(DATASET_PATH, fold, file_name)

    features = extract_features(file_path)
    if features is not None:
        X.append(features)
        y.append(class_label)

X = np.array(X)
y = np.array(y)

# Encode labels
encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42
)

# Model
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

accuracy = model.score(X_test, y_test)

# Save model & encoder
joblib.dump(model, "model/noise_model.pkl")
joblib.dump(encoder, "model/label_encoder.pkl")

print(f"✅ Model trained and saved successfully with accuracy: {accuracy * 100:.2f}%")
