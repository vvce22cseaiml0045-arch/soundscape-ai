import tensorflow as tf

# Load old model (this works on your system)
model = tf.keras.models.load_model(
    "model/cnn_noise_model.h5",
    compile=False
)

# Re-save in new clean format
model.save("model/cnn_noise_model_fixed.keras")

print("✅ Model converted successfully")
