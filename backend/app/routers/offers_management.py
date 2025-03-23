from fastapi import APIRouter, HTTPException
from typing import List
from app.models import Offer, OfferCreate, OfferUpdate
from app.database import db
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/offers-management",
    tags=["offers-management"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=Offer)
async def create_offer(offer: OfferCreate):
    """
    Add a new offer.
    Staff only endpoint.
    """
    logger.info(f"Creating new offer: {offer.name}")
    
    # Validate that all applicable items exist
    invalid_items = [item_id for item_id in offer.applicable_items if item_id not in db.items]
    if invalid_items:
        logger.warning(f"Invalid item IDs in offer: {invalid_items}")
        raise HTTPException(status_code=400, detail=f"Invalid item IDs: {invalid_items}")
    
    new_offer = Offer(
        name=offer.name,
        description=offer.description,
        offer_type=offer.offer_type,
        discount_value=offer.discount_value,
        min_quantity=offer.min_quantity,
        applicable_items=offer.applicable_items,
        start_date=offer.start_date,
        end_date=offer.end_date,
        is_active=offer.is_active
    )
    
    db.offers[new_offer.id] = new_offer
    logger.info(f"Offer created with ID: {new_offer.id}")
    
    return new_offer

@router.post("/{offer_id}", response_model=Offer)
async def update_offer(offer_id: str, offer_update: OfferUpdate):
    """
    Update an existing offer.
    Staff only endpoint.
    """
    if offer_id not in db.offers:
        logger.warning(f"Offer not found for update: {offer_id}")
        raise HTTPException(status_code=404, detail="Offer not found")
    
    # Validate that all applicable items exist if provided
    if offer_update.applicable_items:
        invalid_items = [item_id for item_id in offer_update.applicable_items if item_id not in db.items]
        if invalid_items:
            logger.warning(f"Invalid item IDs in offer update: {invalid_items}")
            raise HTTPException(status_code=400, detail=f"Invalid item IDs: {invalid_items}")
    
    offer = db.offers[offer_id]
    
    update_data = offer_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(offer, key, value)
    
    logger.info(f"Updated offer: {offer.name} (ID: {offer_id})")
    return offer

@router.delete("/{offer_id}", response_model=dict)
async def delete_offer(offer_id: str):
    """
    Remove an offer.
    Staff only endpoint.
    """
    if offer_id not in db.offers:
        logger.warning(f"Offer not found for deletion: {offer_id}")
        raise HTTPException(status_code=404, detail="Offer not found")
    
    offer_name = db.offers[offer_id].name
    del db.offers[offer_id]
    
    logger.info(f"Deleted offer: {offer_name} (ID: {offer_id})")
    return {"message": f"Offer '{offer_name}' deleted successfully"} 