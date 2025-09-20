from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from server import risk_model  # Make sure this exists and has evaluate_student()

# Create FastAPI app
app = FastAPI(
    title="Student Risk Prediction API",
    description="API for predicting student dropout risk using attendance, marks, and fee data",
    version="1.0.0"
)

# Enable CORS so frontend (Builder.io) can call the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change "*" to your frontend URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint to check if backend is running
@app.get("/")
def root():
    return {"message": "Backend is running! Use /predict to upload CSV files."}

# /predict endpoint to receive CSV and return predictions
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Upload a CSV file with student data (Attendance, Marks, Fees, etc.)
    and get risk evaluation from the ML model.
    """
    try:
        # Read CSV into a pandas DataFrame
        df = pd.read_csv(file.file)

        # Pass DataFrame to your ML logic
        result = risk_model.evaluate_student(df)

        return {"status": "success", "result": result}

    except Exception as e:
        return {"status": "error", "message": str(e)}
