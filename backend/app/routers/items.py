from fastapi import APIRouter, HTTPException
from typing import List
from app.models import Item
from app.database import db
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/items",
    tags=["items"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[Item])
async def get_items():
    """
    Get all available items with stock levels and prices.
    """
    logger.info("Fetching all items")
    return list(db.items.values())

@router.get("/{item_id}", response_model=Item)
async def get_item(item_id: str):
    """
    Get details of a specific item by ID.
    """
    if item_id not in db.items:
        logger.warning(f"Item not found: {item_id}")
        raise HTTPException(status_code=404, detail="Item not found")
    
    logger.info(f"Fetching item by ID: {item_id}")
    return db.items[item_id] 