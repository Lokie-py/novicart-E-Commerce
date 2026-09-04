from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

# -------------------------
# Product Schemas
# -------------------------


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    price: Decimal = Field(ge=0)
    image_url: str | None = Field(default=None, max_length=500)
    category: str | None = Field(default=None, max_length=100)
    stock: int = Field(default=0, ge=0)


class ProductResponse(ProductCreate):
    id: int

    class Config:
        from_attributes = True


# -------------------------
# User Schemas
# -------------------------


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=72)


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=1, max_length=72)


# -------------------------
# Cart Schemas
# -------------------------


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(default=1, gt=0)


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int

    class Config:
        from_attributes = True


# -------------------------
# Order Schemas
# -------------------------


class OrderItemResponse(BaseModel):
    product_id: int
    product_name: str
    price: Decimal
    quantity: int
    subtotal: Decimal


class OrderResponse(BaseModel):
    id: int
    total_amount: Decimal
    status: str
    created_at: datetime
    items: list[OrderItemResponse]
