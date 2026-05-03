"""Backend API tests for Flavors of Samundri."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://artisan-samundri.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ----------- Health -----------
def test_root_ok(client):
    r = client.get(f"{API}/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok"


# ----------- Menu -----------
def test_menu_list_count_and_schema(client):
    r = client.get(f"{API}/menu")
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    assert len(items) == 19
    keys = {"id", "name", "description", "price", "category", "featured", "image"}
    for it in items:
        assert keys.issubset(it.keys())
        assert isinstance(it["price"], int)
        assert isinstance(it["featured"], bool)


def test_menu_featured_filter(client):
    r = client.get(f"{API}/menu", params={"featured": "true"})
    assert r.status_code == 200
    items = r.json()
    assert len(items) > 0
    assert all(i["featured"] is True for i in items)


def test_menu_category_filter(client):
    r = client.get(f"{API}/menu", params={"category": "Main Course"})
    assert r.status_code == 200
    items = r.json()
    assert len(items) > 0
    assert all(i["category"] == "Main Course" for i in items)


def test_menu_categories(client):
    r = client.get(f"{API}/menu/categories")
    assert r.status_code == 200
    cats = r.json()
    expected = {"Main Course", "Breads & Sides", "Chai & Coffee", "Desserts", "Refreshers"}
    assert expected.issubset(set(cats))


# ----------- Orders -----------
def test_create_order_persists(client):
    payload = {
        "customer_name": "TEST_Customer",
        "phone": "0308-0471471",
        "address": "Shahbaz Garden Samundri",
        "notes": "extra spicy",
        "items": [{"id": "m1", "name": "Chicken Biryani", "price": 450, "quantity": 2}],
        "total": 900,
    }
    r = client.post(f"{API}/orders", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "id" in data and len(data["id"]) > 0
    assert data["status"] == "pending"
    assert data["total"] == 900
    assert data["customer_name"] == "TEST_Customer"

    # GET list and confirm new order present
    r2 = client.get(f"{API}/orders")
    assert r2.status_code == 200
    orders = r2.json()
    ids = [o["id"] for o in orders]
    assert data["id"] in ids


def test_create_order_empty_items_400(client):
    payload = {
        "customer_name": "TEST_Empty",
        "phone": "123",
        "address": "x",
        "items": [],
        "total": 0,
    }
    r = client.post(f"{API}/orders", json=payload)
    assert r.status_code == 400


def test_orders_sorted_desc(client):
    r = client.get(f"{API}/orders")
    assert r.status_code == 200
    orders = r.json()
    if len(orders) >= 2:
        assert orders[0]["created_at"] >= orders[1]["created_at"]


# ----------- Contact -----------
def test_create_contact_and_list(client):
    payload = {
        "name": "TEST_Visitor",
        "email": "test@example.com",
        "phone": "0308-0471471",
        "message": "Hello from test",
    }
    r = client.post(f"{API}/contact", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["name"] == "TEST_Visitor"
    assert data["email"] == "test@example.com"
    assert "id" in data

    r2 = client.get(f"{API}/contact")
    assert r2.status_code == 200
    msgs = r2.json()
    assert any(m["id"] == data["id"] for m in msgs)
