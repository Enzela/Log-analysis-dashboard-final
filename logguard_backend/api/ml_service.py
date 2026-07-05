import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib
import os
import re
from datetime import datetime

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')

def extract_features(entry):
    """
    Extract numerical features from a log entry for ML model.
    """
    event = entry.get('event', '')
    message = entry.get('message', '')
    ip = entry.get('ip', '')
    timestamp = entry.get('timestamp', '')

    # 1. Length features (normalized)
    event_len = len(event) / 100.0
    msg_len = len(message) / 100.0
    ip_len = len(ip) / 15.0

    # 2. Keyword-based feature (suspicious words count)
    suspicious_words = ['failed', 'unauthorized', 'brute', 'invalid', 'attempt', 'scan', 'probe', 'force', 'error', 'critical']
    text = (event + ' ' + message).lower()
    suspicious_count = sum(1 for w in suspicious_words if w in text) / len(suspicious_words)

    # 3. Time feature (hour of day, 0-23 normalized)
    hour = 0
    if timestamp:
        try:
            if isinstance(timestamp, str):
                dt = datetime.strptime(timestamp, '%Y-%m-%d %H:%M:%S')
                hour = dt.hour / 24.0
            else:
                hour = timestamp.hour / 24.0
        except:
            pass

    # 4. IP numeric feature (first octet normalized)
    ip_num = 0
    if ip:
        try:
            first_octet = int(ip.split('.')[0]) if ip.count('.') >= 3 else 0
            ip_num = first_octet / 255.0
        except:
            pass

    return np.array([event_len, msg_len, ip_len, suspicious_count, hour, ip_num])

def get_model():
    """Load or train Isolation Forest model."""
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    else:
        print("⚠️ Model not found. Training a new Isolation Forest model on synthetic data...")
        from sklearn.ensemble import IsolationForest
        # Generate synthetic normal data
        np.random.seed(42)
        normal_data = []
        for _ in range(1000):
            # Normal patterns: short event, low suspicious count, typical hours
            features = [
                np.random.uniform(0.1, 0.5),  # event_len
                np.random.uniform(0.1, 0.6),  # msg_len
                np.random.uniform(0.2, 0.5),  # ip_len
                np.random.uniform(0.0, 0.15), # suspicious_count
                np.random.uniform(0.2, 0.8),  # hour (business hours)
                np.random.uniform(0.1, 0.6)   # ip_num
            ]
            normal_data.append(features)
        # Generate some anomalous data
        anomaly_data = []
        for _ in range(50):
            features = [
                np.random.uniform(0.6, 1.0),  # event_len (long)
                np.random.uniform(0.7, 1.0),  # msg_len
                np.random.uniform(0.0, 0.2),  # ip_len (unusual)
                np.random.uniform(0.5, 1.0),  # suspicious_count
                np.random.uniform(0.0, 0.2),  # hour (off-hours)
                np.random.uniform(0.8, 1.0)   # ip_num (unusual)
            ]
            anomaly_data.append(features)
        X_train = np.array(normal_data + anomaly_data)
        model = IsolationForest(contamination=0.05, random_state=42)
        model.fit(X_train)
        joblib.dump(model, MODEL_PATH)
        print("✅ Model trained and saved to", MODEL_PATH)
        return model

def predict_anomaly(entry):
    """
    Predict if a log entry is anomalous.
    Returns: (is_anomaly: bool, score: float)
    """
    model = get_model()
    features = extract_features(entry)
    X = features.reshape(1, -1)
    prediction = model.predict(X)[0]
    score = model.score_samples(X)[0]  # negative -> more anomalous
    is_anomaly = (prediction == -1)
    return is_anomaly, float(score)