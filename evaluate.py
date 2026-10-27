import pandas as pd
import torch
from transformers import BertTokenizer, BertForSequenceClassification
from sklearn.metrics import confusion_matrix, classification_report
import numpy as np
import matplotlib.pyplot as plt

# ===== CONFIG =====
MODEL_PATH = "./my_bert_model"
TEST_FILE = "test.csv"  # <-- YOU NEED THIS FILE

LABELS = ['Anxiety', 'Bipolar', 'Depression', 'Normal',
          'Personality disorder', 'Stress', 'Suicidal']

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ===== LOAD MODEL =====
tokenizer = BertTokenizer.from_pretrained(MODEL_PATH)
model = BertForSequenceClassification.from_pretrained(MODEL_PATH).to(device)
model.eval()

# ===== LOAD DATA =====
df = pd.read_csv(TEST_FILE)

texts = df["text"].tolist()
y_true = df["label"].tolist()

# ===== MAP LABELS TO INDEX =====
label_to_id = {label: i for i, label in enumerate(LABELS)}
y_true_ids = [label_to_id[label] for label in y_true]

# ===== PREDICTIONS =====
y_pred_ids = []

for text in texts:
    inputs = tokenizer(text, return_tensors="pt",
                       truncation=True, padding=True, max_length=128).to(device)

    with torch.no_grad():
        outputs = model(**inputs)

    pred = torch.argmax(outputs.logits, dim=1).item()
    y_pred_ids.append(pred)

# ===== CONFUSION MATRIX =====
cm = confusion_matrix(y_true_ids, y_pred_ids)

print("\nConfusion Matrix:\n")
print(cm)

# ===== CLASSIFICATION REPORT =====
print("\nClassification Report:\n")
print(classification_report(y_true_ids, y_pred_ids, target_names=LABELS))

# ===== PLOT =====
plt.figure(figsize=(8, 6))
plt.imshow(cm)
plt.colorbar()

plt.xticks(range(len(LABELS)), LABELS, rotation=45)
plt.yticks(range(len(LABELS)), LABELS)

for i in range(len(LABELS)):
    for j in range(len(LABELS)):
        plt.text(j, i, cm[i, j], ha="center", va="center")

plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title("Confusion Matrix")

plt.tight_layout()
plt.savefig("confusion_matrix.png")
plt.show()