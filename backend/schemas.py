from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal


class ProductCreate(BaseModel):
    name: str
    description: str | None = None
    price: Decimal
    image_url: str | None = None
    category: str | None = None
    stock: int = 0


class ProductResponse(ProductCreate):
    id: int

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: str
    password: str


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int

    class Config:
        from_attributes = True


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
