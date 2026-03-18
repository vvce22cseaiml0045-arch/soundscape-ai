import os
import numpy as np
import tensorflow as tf
from cnn.utils import generate_spectrogram

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "model", "cnn_noise_model.h5")
CLASSES_PATH = os.path.join(BASE_DIR, "..", "model", "cnn_classes.npy")

model = tf.keras.models.load_model(MODEL_PATH)
classes = np.load(CLASSES_PATH, allow_pickle=True)

def predict_cnn(audio_path):
    spec = generate_spectrogram(audio_path)
    spec = np.expand_dims(spec, axis=0)

    preds = model.predict(spec, verbose=0)
    idx = int(np.argmax(preds))

    return str(classes[idx]), float(np.max(preds))
