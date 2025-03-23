from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum
from datetime import datetime
import uuid

class OfferType(str, Enum):
    PERCENTAGE = "percentage"
    FIXED = "fixed"
    BUY_X_GET_Y = "buy_x_get_y"

class Item(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    stock: int
    category: str

class Offer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    offer_type: OfferType
    discount_value: float
    min_quantity: Optional[int] = None
    applicable_items: List[str]  # List of item IDs
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: bool = True

class OrderItem(BaseModel):
    item_id: str
    quantity: int
    unit_price: float
    applied_offer_id: Optional[str] = None
    discount_amount: float = 0

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    items: List[OrderItem]
    total_amount: float
    discount_amount: float = 0
    final_amount: float
    created_at: datetime = Field(default_factory=datetime.now)

class ItemCreate(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    category: str

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category: Optional[str] = None

class OfferCreate(BaseModel):
    name: str
    description: str
    offer_type: OfferType
    discount_value: float
    min_quantity: Optional[int] = None
    applicable_items: List[str]
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: bool = True

class OfferUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    offer_type: Optional[OfferType] = None
    discount_value: Optional[float] = None
    min_quantity: Optional[int] = None
    applicable_items: Optional[List[str]] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None 