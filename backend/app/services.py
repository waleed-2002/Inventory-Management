from typing import List, Dict, Optional, Tuple
from app.models import Item, Offer, OrderItem, Order
from app.database import db
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

def calculate_applicable_offers(items: List[OrderItem]) -> Dict[str, float]:
    """
    Calculate which offers apply to the items in the order and the discount amount.
    Returns a dictionary mapping item_id to discount amount.
    """
    applicable_discounts = {}
    item_counts_by_category = {}

    # Group items by category for category-based offers
    for order_item in items:
        if order_item.item_id in db.items:
            item = db.items[order_item.item_id]
            if item.category not in item_counts_by_category:
                item_counts_by_category[item.category] = []
            item_counts_by_category[item.category].append((order_item, item))

    # Check each offer for applicability
    now = datetime.now()
    for offer_id, offer in db.offers.items():
        # Skip inactive offers or offers outside date range
        if not offer.is_active:
            continue
        if offer.start_date and offer.start_date > now:
            continue
        if offer.end_date and offer.end_date < now:
            continue

        # Apply the offer based on its type
        if offer.offer_type == "percentage":
            for order_item in items:
                if order_item.item_id in offer.applicable_items:
                    item = db.items[order_item.item_id]
                    discount = (offer.discount_value / 100) * order_item.unit_price * order_item.quantity
                    if order_item.item_id not in applicable_discounts or discount > applicable_discounts[order_item.item_id][1]:
                        applicable_discounts[order_item.item_id] = (offer_id, discount)
                        logger.info(f"Applied percentage discount of {discount} to item {item.name}")

        elif offer.offer_type == "fixed":
            for order_item in items:
                if order_item.item_id in offer.applicable_items and (not offer.min_quantity or order_item.quantity >= offer.min_quantity):
                    item = db.items[order_item.item_id]
                    # Limit fixed discount to item total
                    item_total = order_item.unit_price * order_item.quantity
                    discount = min(offer.discount_value, item_total)
                    if order_item.item_id not in applicable_discounts or discount > applicable_discounts[order_item.item_id][1]:
                        applicable_discounts[order_item.item_id] = (offer_id, discount)
                        logger.info(f"Applied fixed discount of {discount} to item {item.name}")

        elif offer.offer_type == "buy_x_get_y":
            # This would be a more complex implementation based on your specific requirements
            # For example, buy 2 get 1 free from the same category
            pass

    # Convert to simpler format for return
    return {item_id: discount for item_id, (offer_id, discount) in applicable_discounts.items()}

def process_order(order_items: List[OrderItem]) -> Tuple[Order, List[str]]:
    """
    Process an order, applying offers and calculating totals.
    Returns the processed order and a list of error messages if any.
    """
    errors = []
    processed_items = []
    
    # Validate items and check stock
    for item in order_items:
        if item.item_id not in db.items:
            errors.append(f"Item with ID {item.item_id} not found")
            continue
            
        db_item = db.items[item.item_id]
        
        if item.quantity <= 0:
            errors.append(f"Quantity for item {db_item.name} must be greater than 0")
            continue
            
        if db_item.stock < item.quantity:
            errors.append(f"Not enough stock for item {db_item.name}. Available: {db_item.stock}, Requested: {item.quantity}")
            continue
            
        # Update the item with current price
        processed_item = OrderItem(
            item_id=item.item_id,
            quantity=item.quantity,
            unit_price=db_item.price
        )
        processed_items.append(processed_item)
    
    if errors:
        return None, errors
    
    # Calculate total before discounts
    total_amount = sum(item.unit_price * item.quantity for item in processed_items)
    
    # Apply offers
    applicable_discounts = calculate_applicable_offers(processed_items)
    total_discount = 0
    
    for item in processed_items:
        if item.item_id in applicable_discounts:
            discount = applicable_discounts[item.item_id]
            item.discount_amount = discount
            total_discount += discount
    
    # Create the order
    order = Order(
        items=processed_items,
        total_amount=total_amount,
        discount_amount=total_discount,
        final_amount=total_amount - total_discount
    )
    
    # Update inventory
    if len(errors) == 0:
        for item in processed_items:
            db_item = db.items[item.item_id]
            db_item.stock -= item.quantity
            logger.info(f"Updated stock for {db_item.name}: new stock = {db_item.stock}")
    
    return order, errors 