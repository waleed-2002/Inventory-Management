from fastapi import APIRouter, HTTPException
from typing import List
from app.models import Offer
from app.database import db
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/offers",
    tags=["offers"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[Offer])
async def get_offers():
    """
    Get all available offers.
    Only returns active offers within their validity period.
    """
    logger.info("Fetching active offers")
    
    now = datetime.now()
    active_offers = [
        offer for offer in db.offers.values()
        if offer.is_active and
        (offer.start_date is None or offer.start_date <= now) and
        (offer.end_date is None or offer.end_date >= now)
    ]
    
    return active_offers

@router.get("/{offer_id}", response_model=Offer)
async def get_offer(offer_id: str):
    """
    Get details of a specific offer by ID.
    """
    if offer_id not in db.offers:
        logger.warning(f"Offer not found: {offer_id}")
        raise HTTPException(status_code=404, detail="Offer not found")
    
    logger.info(f"Fetching offer by ID: {offer_id}")
    return db.offers[offer_id] 