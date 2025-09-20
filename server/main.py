from fastapi import FastAPI, UploadFile, File
import pandas as pd
from server import risk_model  # Import your ML logic from risk_model.py

app = FastAPI(
    title="Student Risk Prediction API",
    description="API for predicting student dropout risk using attendance, marks, and fee data",
    version="1.0.0"
)

@app.get("/")
def root():
    return {"message": "Backend is running! Use /predict to upload CSV files."}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Upload a CSV file with student data (Attendance, Marks, Fees etc.)
    and get risk evaluation from the ML model.
    """
    try:
        # Read CSV into DataFrame
        df = pd.read_csv(file.file)

        # Pass DataFrame to your ML logic
        result = risk_model.evaluate_student(df)

        return {"status": "success", "result": result}

    except Exception as e:
        return {"status": "error", "message": str(e)}
