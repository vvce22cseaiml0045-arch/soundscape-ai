import os
os.environ["TF_USE_LEGACY_KERAS"] = "0"



import tensorflow as tf
import numpy as np
import librosa
import base64
import cv2
from io import BytesIO
import matplotlib.pyplot as plt

# ===============================
# Load model ONCE (SAFE LOAD)
# ===============================
model = tf.keras.models.load_model(
    "model/cnn_noise_model.h5",
    compile=False
)

# ===============================
# Force model build
# ===============================
TRAINING_WIDTH = 280
dummy_input = tf.zeros((1, 128, TRAINING_WIDTH, 1))
_ = model(dummy_input)

# ===============================
# Grad-CAM Function
# ===============================
def generate_gradcam(audio_path):
    try:
        # Load audio
        y, sr = librosa.load(audio_path, sr=22050)

        # Mel spectrogram
        mel = librosa.feature.melspectrogram(
            y=y,
            sr=sr,
            n_mels=128,
            n_fft=2048,
            hop_length=512,
            fmax=8000
        )

        mel = librosa.power_to_db(mel, ref=np.max)

        # Pad / trim
        if mel.shape[1] < TRAINING_WIDTH:
            mel = np.pad(mel, ((0, 0), (0, TRAINING_WIDTH - mel.shape[1])))
        else:
            mel = mel[:, :TRAINING_WIDTH]

        X = mel.reshape(1, 128, TRAINING_WIDTH, 1)

        # -------------------------------
        # Find last Conv layer SAFELY
        # -------------------------------
        last_conv = None
        for layer in reversed(model.layers):
            if isinstance(layer, tf.keras.layers.Conv2D):
                last_conv = layer
                break

        if last_conv is None:
            raise ValueError("No Conv2D layer found for Grad-CAM")

        grad_model = tf.keras.models.Model(
            inputs=model.input,
            outputs=[last_conv.output, model.output]
        )

        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(X)
            class_idx = tf.argmax(predictions[0])
            loss = predictions[:, class_idx]

        grads = tape.gradient(loss, conv_outputs)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

        heatmap = tf.reduce_sum(
            conv_outputs[0] * pooled_grads, axis=-1
        )

        heatmap = tf.maximum(heatmap, 0)
        max_val = tf.reduce_max(heatmap)
        heatmap = heatmap / (max_val + 1e-8)  # avoid divide by zero

        # Plot heatmap
        plt.figure(figsize=(4, 3))
        plt.imshow(heatmap, cmap="jet")
        plt.axis("off")

        buf = BytesIO()
        plt.savefig(buf, format="png", bbox_inches="tight")
        plt.close()
        buf.seek(0)

        return base64.b64encode(buf.read()).decode("utf-8")

    except Exception as e:
        print("GradCAM error:", e)
        return None
