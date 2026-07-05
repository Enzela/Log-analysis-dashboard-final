import os
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
import re
from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    help = 'Train Isolation Forest on REAL CICIDS 2017 dataset'

    def handle(self, *args, **options):
        self.stdout.write('🚀 Loading REAL CICIDS 2017 dataset...')
        data_dir = os.path.join(settings.BASE_DIR, 'data')
        
        # Only CICIDS files
        pattern = r'(monday|tuesday|wednesday|thursday|friday).*\.csv'
        csv_files = [f for f in os.listdir(data_dir) if re.match(pattern, f, re.IGNORECASE)]
        
        if not csv_files:
            self.stdout.write(self.style.ERROR('❌ No CICIDS files found!'))
            return
        
        self.stdout.write(f'📁 Found {len(csv_files)} files.')
        
        SAMPLE_PER_FILE = 5000  # 5000 per file = 50k total (safe for RAM)
        all_dfs = []
        
        for file in csv_files:
            self.stdout.write(f'📂 Loading {file}...')
            df = pd.read_csv(os.path.join(data_dir, file), low_memory=False)
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            if not numeric_cols:
                continue
            df_numeric = df[numeric_cols].dropna()
            if len(df_numeric) > SAMPLE_PER_FILE:
                df_sampled = df_numeric.sample(n=SAMPLE_PER_FILE, random_state=42)
            else:
                df_sampled = df_numeric
            all_dfs.append(df_sampled)
            self.stdout.write(f'   Sampled: {len(df_sampled)} rows')
        
        X_train = pd.concat(all_dfs, ignore_index=True).values
        self.stdout.write(f'Total samples: {len(X_train)}')
        
        self.stdout.write(' Training Isolation Forest...')
        model = IsolationForest(contamination=0.1, random_state=42, n_estimators=100, n_jobs=-1)
        model.fit(X_train)
        
        model_path = os.path.join(settings.BASE_DIR, 'api', 'model.pkl')
        joblib.dump(model, model_path)
        self.stdout.write(self.style.SUCCESS(f'Real CICIDS Model saved to {model_path}'))