from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.routers import items, orders, offers, items_management, offers_management
from app.logger import setup_logger

# Setup logger
logger = setup_logger()

app = FastAPI(title="Inventory Management System")

# CORS middleware for frontend interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(items.router)
app.include_router(orders.router)
app.include_router(offers.router)
app.include_router(items_management.router)
app.include_router(offers_management.router)

@app.get("/")
async def root():
    logger.info("Root endpoint accessed")
    return {"message": "Welcome to the Inventory Management System API"}

if __name__ == "__main__":
    logger.info("Starting Inventory Management System API")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 