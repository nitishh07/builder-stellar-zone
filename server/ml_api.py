# ml_api.py
from fastapi import FastAPI
import uvicorn
from risk_model import predict_risk   # import your ML function

app = FastAPI()

@app.get("/risk")
def get_risk(age: int, income: float):
    result = predict_risk(age, income)
    return {"risk": result}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
