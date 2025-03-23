from fastapi import APIRouter, HTTPException, Body
from typing import List
from app.models import Order, OrderItem
from app.database import db
from app.services import process_order
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/orders",
    tags=["orders"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=Order)
async def create_order(order_items: List[OrderItem] = Body(...)):
    """
    Place a new order with the specified items.
    Offers will be automatically applied if conditions are met.
    """
    logger.info(f"Processing new order with {len(order_items)} item(s)")
    
    order, errors = process_order(order_items)
    
    if errors:
        logger.error(f"Order processing failed: {errors}")
        raise HTTPException(status_code=400, detail=errors)
    
    # Save the order to the database
    db.orders[order.id] = order
    logger.info(f"Order created successfully with ID: {order.id}")
    
    return order

@router.get("/", response_model=List[Order])
async def get_orders():
    """
    Get all orders (for demonstration purposes).
    In a real system, this would be restricted to staff or filtered by user.
    """
    logger.info("Fetching all orders")
    return list(db.orders.values())

@router.get("/{order_id}", response_model=Order)
async def get_order(order_id: str):
    """
    Get details of a specific order by ID.
    """
    if order_id not in db.orders:
        logger.warning(f"Order not found: {order_id}")
        raise HTTPException(status_code=404, detail="Order not found")
    
    logger.info(f"Fetching order by ID: {order_id}")
    return db.orders[order_id] 