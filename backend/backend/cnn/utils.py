import librosa
import numpy as np

def generate_spectrogram(file_path):
    audio, sr = librosa.load(file_path, sr=22050)

    mel = librosa.feature.melspectrogram(
        y=audio,
        sr=sr,
        n_mels=128,
        n_fft=2048,
        hop_length=512,
        fmax=8000
    )

    mel = librosa.power_to_db(mel, ref=np.max)
    mel = mel[..., np.newaxis]  # (128, T, 1)
    return mel
