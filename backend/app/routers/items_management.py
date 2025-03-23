from fastapi import APIRouter, HTTPException, Body
from typing import List
from app.models import Item, ItemCreate, ItemUpdate
from app.database import db
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/items-management",
    tags=["items-management"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=Item)
async def create_item(item: ItemCreate):
    """
    Add a new item to the inventory.
    Staff only endpoint.
    """
    logger.info(f"Creating new item: {item.name}")
    
    new_item = Item(
        name=item.name,
        description=item.description,
        price=item.price,
        stock=item.stock,
        category=item.category
    )
    
    db.items[new_item.id] = new_item
    logger.info(f"Item created with ID: {new_item.id}")
    
    return new_item

@router.post("/{item_id}", response_model=Item)
async def update_item(item_id: str, item_update: ItemUpdate):
    """
    Update an existing item in the inventory.
    Staff only endpoint.
    """
    if item_id not in db.items:
        logger.warning(f"Item not found for update: {item_id}")
        raise HTTPException(status_code=404, detail="Item not found")
    
    item = db.items[item_id]
    
    update_data = item_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)
    
    logger.info(f"Updated item: {item.name} (ID: {item_id})")
    return item

@router.delete("/{item_id}", response_model=dict)
async def delete_item(item_id: str):
    """
    Remove an item from the inventory.
    Staff only endpoint.
    """
    if item_id not in db.items:
        logger.warning(f"Item not found for deletion: {item_id}")
        raise HTTPException(status_code=404, detail="Item not found")
    
    item_name = db.items[item_id].name
    del db.items[item_id]
    
    logger.info(f"Deleted item: {item_name} (ID: {item_id})")
    return {"message": f"Item '{item_name}' deleted successfully"} 