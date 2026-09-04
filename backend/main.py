import os

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from decimal import Decimal
from database import engine, Base, SessionLocal
import models

from schemas import (
    ProductCreate,
    ProductResponse,
    UserCreate,
    UserResponse,
    UserLogin,
    CartItemCreate,
    CartItemResponse,
    OrderResponse,
)

from security import hash_password, verify_password
from auth import create_access_token
from dependencies import get_current_user, get_current_admin

# -------------------------
# Environment Configuration
# -------------------------

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


# -------------------------
# Database
# -------------------------

Base.metadata.create_all(bind=engine)


# -------------------------
# FastAPI App
# -------------------------

app = FastAPI()


# -------------------------
# CORS Configuration
# -------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# Database Dependency
# -------------------------


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# -------------------------
# Home
# -------------------------


@app.get("/")
def home():
    return {"message": "Welcome to NoviCart API"}


# -------------------------
# Product APIs
# -------------------------


@app.post("/products", response_model=ProductResponse)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin),
):
    new_product = models.Product(
        name=product.name,
        description=product.description,
        price=product.price,
        image_url=product.image_url,
        category=product.category,
        stock=product.stock,
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


@app.get("/products/categories", response_model=list[str])
def get_product_categories(
    db: Session = Depends(get_db),
):
    categories = (
        db.query(models.Product.category)
        .filter(models.Product.category.isnot(None))
        .filter(models.Product.category != "")
        .distinct()
        .order_by(models.Product.category)
        .all()
    )

    return [category[0] for category in categories]


@app.get("/products", response_model=list[ProductResponse])
def get_products(
    search: str | None = None,
    category: str | None = None,
    sort: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Product)

    # Search
    if search:
        search_term = f"%{search.strip()}%"

        query = query.filter(
            models.Product.name.ilike(search_term)
            | models.Product.description.ilike(search_term)
            | models.Product.category.ilike(search_term)
        )

    # Category filter
    if category:
        query = query.filter(models.Product.category.ilike(category.strip()))

    # Price sorting
    if sort == "price_asc":
        query = query.order_by(models.Product.price.asc())

    elif sort == "price_desc":
        query = query.order_by(models.Product.price.desc())

    return query.all()


@app.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


@app.put("/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.name = product_data.name
    product.description = product_data.description
    product.price = product_data.price
    product.image_url = product_data.image_url
    product.category = product_data.category
    product.stock = product_data.stock

    db.commit()
    db.refresh(product)

    return product


@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()

    return {"message": "Product deleted successfully"}


# -------------------------
# Authentication APIs
# -------------------------


@app.post("/auth/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = (
        db.query(models.User).filter(models.User.email == user.email).first()
    )

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hash_password(user.password)

    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        role="customer",
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@app.post("/auth/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    existing_user = (
        db.query(models.User).filter(models.User.email == user.email).first()
    )

    if not existing_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    password_valid = verify_password(user.password, existing_user.password_hash)

    if not password_valid:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(existing_user.id)

    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/auth/me", response_model=UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


# -------------------------
# Cart APIs
# -------------------------


@app.post("/cart", response_model=CartItemResponse)
def add_to_cart(
    cart_item: CartItemCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = (
        db.query(models.Product)
        .filter(models.Product.id == cart_item.product_id)
        .first()
    )

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if cart_item.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

    existing_item = (
        db.query(models.CartItem)
        .filter(
            models.CartItem.user_id == current_user.id,
            models.CartItem.product_id == cart_item.product_id,
        )
        .first()
    )

    if existing_item:
        new_quantity = existing_item.quantity + cart_item.quantity

        if new_quantity > product.stock:
            raise HTTPException(
                status_code=400,
                detail=f"Only {product.stock} units of {product.name} are available",
            )

        existing_item.quantity = new_quantity

    else:
        if cart_item.quantity > product.stock:
            raise HTTPException(
                status_code=400,
                detail=f"Only {product.stock} units of {product.name} are available",
            )

        existing_item = models.CartItem(
            user_id=current_user.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
        )

        db.add(existing_item)

    db.commit()
    db.refresh(existing_item)

    return existing_item


@app.get("/cart", response_model=list[CartItemResponse])
def get_cart(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart_items = (
        db.query(models.CartItem)
        .filter(models.CartItem.user_id == current_user.id)
        .all()
    )

    return cart_items


@app.patch("/cart/{cart_item_id}", response_model=CartItemResponse)
def update_cart_quantity(
    cart_item_id: int,
    quantity: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than 0",
        )

    cart_item = (
        db.query(models.CartItem)
        .filter(
            models.CartItem.id == cart_item_id,
            models.CartItem.user_id == current_user.id,
        )
        .first()
    )

    if not cart_item:
        raise HTTPException(
            status_code=404,
            detail="Cart item not found",
        )

    product = (
        db.query(models.Product)
        .filter(models.Product.id == cart_item.product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    if quantity > product.stock:
        raise HTTPException(
            status_code=400,
            detail=f"Only {product.stock} units of {product.name} are available",
        )

    cart_item.quantity = quantity

    db.commit()
    db.refresh(cart_item)

    return cart_item


@app.delete("/cart/{cart_item_id}")
def remove_from_cart(
    cart_item_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart_item = (
        db.query(models.CartItem)
        .filter(
            models.CartItem.id == cart_item_id,
            models.CartItem.user_id == current_user.id,
        )
        .first()
    )

    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(cart_item)
    db.commit()

    return {"message": "Item removed from cart"}


# -------------------------
# Order APIs
# -------------------------


@app.post("/orders", response_model=OrderResponse)
def create_order(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart_items = (
        db.query(models.CartItem)
        .filter(models.CartItem.user_id == current_user.id)
        .all()
    )

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    try:
        total_amount = Decimal("0.00")
        order_items_data = []

        # Validate cart and calculate total
        for cart_item in cart_items:
            product = (
                db.query(models.Product)
                .filter(models.Product.id == cart_item.product_id)
                .first()
            )

            if not product:
                raise HTTPException(
                    status_code=404, detail=f"Product {cart_item.product_id} not found"
                )

            if cart_item.quantity <= 0:
                raise HTTPException(
                    status_code=400, detail=f"Invalid quantity for {product.name}"
                )

            if product.stock < cart_item.quantity:
                raise HTTPException(
                    status_code=400, detail=f"Not enough stock for {product.name}"
                )

            subtotal = product.price * cart_item.quantity
            total_amount += subtotal

            order_items_data.append(
                {
                    "product_id": product.id,
                    "product_name": product.name,
                    "price": product.price,
                    "quantity": cart_item.quantity,
                    "subtotal": subtotal,
                }
            )

        # Create order
        new_order = models.Order(
            user_id=current_user.id,
            total_amount=total_amount,
            status="confirmed",
        )

        db.add(new_order)
        db.flush()

        # Create order items and update stock
        for item in order_items_data:
            order_item = models.OrderItem(
                order_id=new_order.id,
                product_id=item["product_id"],
                product_name=item["product_name"],
                price=item["price"],
                quantity=item["quantity"],
                subtotal=item["subtotal"],
            )

            db.add(order_item)

            product = (
                db.query(models.Product)
                .filter(models.Product.id == item["product_id"])
                .first()
            )

            product.stock -= item["quantity"]

        # Clear cart
        for cart_item in cart_items:
            db.delete(cart_item)

        # Commit everything together
        db.commit()
        db.refresh(new_order)

        return {
            "id": new_order.id,
            "total_amount": new_order.total_amount,
            "status": new_order.status,
            "created_at": new_order.created_at,
            "items": order_items_data,
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create order")


@app.get("/orders", response_model=list[OrderResponse])
def get_my_orders(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    orders = (
        db.query(models.Order).filter(models.Order.user_id == current_user.id).all()
    )

    result = []

    for order in orders:

        items = (
            db.query(models.OrderItem)
            .filter(models.OrderItem.order_id == order.id)
            .all()
        )

        result.append(
            {
                "id": order.id,
                "total_amount": order.total_amount,
                "status": order.status,
                "created_at": order.created_at,
                "items": [
                    {
                        "product_id": item.product_id,
                        "product_name": item.product_name,
                        "price": item.price,
                        "quantity": item.quantity,
                        "subtotal": item.subtotal,
                    }
                    for item in items
                ],
            }
        )

    return result


@app.get("/orders/{order_id}", response_model=OrderResponse)
def get_my_order(
    order_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = (
        db.query(models.Order)
        .filter(
            models.Order.id == order_id,
            models.Order.user_id == current_user.id,
        )
        .first()
    )

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    items = (
        db.query(models.OrderItem).filter(models.OrderItem.order_id == order.id).all()
    )

    return {
        "id": order.id,
        "total_amount": order.total_amount,
        "status": order.status,
        "created_at": order.created_at,
        "items": [
            {
                "product_id": item.product_id,
                "product_name": item.product_name,
                "price": item.price,
                "quantity": item.quantity,
                "subtotal": item.subtotal,
            }
            for item in items
        ],
    }


# -------------------------
# Admin Order APIs
# -------------------------


@app.get("/admin/orders")
def get_all_orders(
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    orders = db.query(models.Order).all()

    result = []

    for order in orders:

        user = db.query(models.User).filter(models.User.id == order.user_id).first()

        items = (
            db.query(models.OrderItem)
            .filter(models.OrderItem.order_id == order.id)
            .all()
        )

        result.append(
            {
                "id": order.id,
                "user_id": order.user_id,
                "customer_name": user.name if user else "Unknown",
                "customer_email": user.email if user else "Unknown",
                "total_amount": order.total_amount,
                "status": order.status,
                "created_at": order.created_at,
                "items": [
                    {
                        "product_id": item.product_id,
                        "product_name": item.product_name,
                        "price": item.price,
                        "quantity": item.quantity,
                        "subtotal": item.subtotal,
                    }
                    for item in items
                ],
            }
        )

    return result


@app.patch("/admin/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status: str,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    allowed_statuses = {
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
    }

    status = status.strip().lower()

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid status. Allowed statuses: "
                "confirmed, processing, shipped, delivered, cancelled"
            ),
        )

    order = db.query(models.Order).filter(models.Order.id == order_id).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    order.status = status

    db.commit()
    db.refresh(order)

    return {
        "message": "Order status updated successfully",
        "order_id": order.id,
        "status": order.status,
    }


@app.get("/admin/stats")
def get_admin_stats(
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    total_products = db.query(models.Product).count()

    total_users = db.query(models.User).count()

    total_orders = db.query(models.Order).count()

    total_revenue = sum(order.total_amount for order in db.query(models.Order).all())

    return {
        "total_products": total_products,
        "total_users": total_users,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
    }
