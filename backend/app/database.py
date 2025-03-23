from typing import Dict, List
from app.models import Item, Offer, Order
import logging

logger = logging.getLogger(__name__)

# In-memory database
class Database:
    def __init__(self):
        self.items: Dict[str, Item] = {}
        self.offers: Dict[str, Offer] = {}
        self.orders: Dict[str, Order] = {}
        self._initialize_sample_data()

    def _initialize_sample_data(self):
        # Sample items
        sample_items = [
            Item(
                name="Laptop",
                description="High-performance laptop",
                price=999.99,
                stock=15,
                category="Electronics"
            ),
            Item(
                name="Smartphone",
                description="Latest smartphone model",
                price=699.99,
                stock=20,
                category="Electronics"
            ),
            Item(
                name="Headphones",
                description="Noise-cancelling headphones",
                price=149.99,
                stock=30,
                category="Electronics"
            ),
            Item(
                name="Coffee Maker",
                description="Automatic coffee maker",
                price=79.99,
                stock=10,
                category="Kitchen"
            ),
            Item(
                name="Blender",
                description="High-speed blender",
                price=49.99,
                stock=25,
                category="Kitchen"
            )
        ]

        for item in sample_items:
            self.items[item.id] = item
            logger.info(f"Added sample item: {item.name} with ID: {item.id}")

        # Sample offers
        sample_offers = [
            Offer(
                name="Electronics Sale",
                description="20% off all electronics",
                offer_type="percentage",
                discount_value=20.0,
                applicable_items=[item.id for item in sample_items if item.category == "Electronics"],
                is_active=True
            ),
            Offer(
                name="Kitchen Special",
                description="Buy one kitchen item, get $10 off",
                offer_type="fixed",
                discount_value=10.0,
                min_quantity=1,
                applicable_items=[item.id for item in sample_items if item.category == "Kitchen"],
                is_active=True
            )
        ]

        for offer in sample_offers:
            self.offers[offer.id] = offer
            logger.info(f"Added sample offer: {offer.name} with ID: {offer.id}")

# Create a singleton instance
db = Database() 