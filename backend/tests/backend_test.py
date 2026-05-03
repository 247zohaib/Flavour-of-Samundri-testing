"""Backend API tests for Flavors of Samundri (public + admin)."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://artisan-samundri.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "owner@flavorsofsamundri.com"
ADMIN_PASSWORD = "Samundri@2026"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_token(client):
    r = client.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    return r.json()["token"]


@pytest.fixture(scope="module")
def admin_client(client, admin_token):
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {admin_token}"})
    return s


# ----------- Health -----------
def test_root_ok(client):
    r = client.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# ----------- Public Menu -----------
def test_menu_list_count_and_schema(client):
    r = client.get(f"{API}/menu")
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list) and len(items) == 19
    keys = {"id", "name", "description", "price", "category", "featured", "image"}
    for it in items:
        assert keys.issubset(it.keys())


def test_menu_featured_filter(client):
    r = client.get(f"{API}/menu", params={"featured": "true"})
    assert r.status_code == 200
    items = r.json()
    assert len(items) > 0 and all(i["featured"] for i in items)


def test_menu_category_filter(client):
    r = client.get(f"{API}/menu", params={"category": "Main Course"})
    assert r.status_code == 200
    assert all(i["category"] == "Main Course" for i in r.json())


def test_menu_categories(client):
    r = client.get(f"{API}/menu/categories")
    assert r.status_code == 200
    expected = {"Main Course", "Breads & Sides", "Chai & Coffee", "Desserts", "Refreshers"}
    assert expected.issubset(set(r.json()))


# ----------- Public Orders (delivery + pickup) -----------
def test_create_delivery_order(client):
    payload = {
        "customer_name": "TEST_DeliveryCust",
        "phone": "0308-0471471",
        "order_type": "delivery",
        "address": "Shahbaz Garden Samundri",
        "notes": "extra spicy",
        "items": [{"id": "m1", "name": "Chicken Biryani", "price": 450, "quantity": 2}],
        "total": 900,
    }
    r = client.post(f"{API}/orders", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["status"] == "pending"
    assert data["total"] == 900
    assert data["order_type"] == "delivery"
    assert data["address"] == "Shahbaz Garden Samundri"
    assert "id" in data and len(data["id"]) > 0


def test_create_pickup_order_no_address(client):
    payload = {
        "customer_name": "TEST_PickupCust",
        "phone": "0300-1234567",
        "order_type": "pickup",
        "address": "",
        "notes": "Preferred pickup time: 7:30 PM",
        "items": [{"id": "b1", "name": "Aloo Paratha", "price": 120, "quantity": 1}],
        "total": 120,
    }
    r = client.post(f"{API}/orders", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["order_type"] == "pickup"
    assert data["total"] == 120


def test_create_delivery_empty_address_400(client):
    payload = {
        "customer_name": "TEST_BadAddr",
        "phone": "1",
        "order_type": "delivery",
        "address": "  ",
        "items": [{"id": "m1", "name": "Chicken Biryani", "price": 450, "quantity": 1}],
        "total": 450,
    }
    r = client.post(f"{API}/orders", json=payload)
    assert r.status_code == 400


def test_create_order_empty_items_400(client):
    payload = {
        "customer_name": "TEST_Empty",
        "phone": "123",
        "order_type": "delivery",
        "address": "x",
        "items": [],
        "total": 0,
    }
    r = client.post(f"{API}/orders", json=payload)
    assert r.status_code == 400


# ----------- Public Contact -----------
def test_create_contact(client):
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
    assert "id" in data


# ----------- Admin Auth -----------
def test_admin_login_success(client):
    r = client.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    data = r.json()
    assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 20
    assert data["user"]["email"] == ADMIN_EMAIL
    assert data["user"]["role"] == "admin"
    assert "id" in data["user"]


def test_admin_login_wrong_password(client):
    r = client.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": "WRONG_PWD"})
    assert r.status_code == 401


def test_admin_login_unknown_email(client):
    r = client.post(f"{API}/admin/login", json={"email": "nobody@example.com", "password": "x"})
    assert r.status_code == 401


def test_admin_me_with_token(admin_client):
    r = admin_client.get(f"{API}/admin/me")
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["email"] == ADMIN_EMAIL
    assert data["role"] == "admin"


def test_admin_me_no_token(client):
    r = client.get(f"{API}/admin/me")
    assert r.status_code == 401


def test_admin_me_invalid_token(client):
    r = requests.get(f"{API}/admin/me", headers={"Authorization": "Bearer not-a-real-token"})
    assert r.status_code == 401


# ----------- Admin Stats -----------
def test_admin_stats(admin_client):
    r = admin_client.get(f"{API}/admin/stats")
    assert r.status_code == 200, r.text
    data = r.json()
    for k in ("total_revenue", "total_orders", "today_revenue", "today_orders", "by_status", "unread_messages"):
        assert k in data
    assert isinstance(data["by_status"], dict)
    assert data["total_orders"] >= 1  # at least one order from earlier tests


def test_admin_stats_requires_auth(client):
    r = client.get(f"{API}/admin/stats")
    assert r.status_code == 401


# ----------- Admin Orders -----------
def test_admin_list_orders(admin_client):
    r = admin_client.get(f"{API}/admin/orders")
    assert r.status_code == 200, r.text
    orders = r.json()
    assert isinstance(orders, list) and len(orders) >= 1
    o = orders[0]
    for k in ("id", "customer_name", "phone", "order_type", "address", "items", "total", "status", "created_at"):
        assert k in o


def test_admin_orders_filter_by_status(admin_client):
    r = admin_client.get(f"{API}/admin/orders", params={"status": "pending"})
    assert r.status_code == 200
    orders = r.json()
    assert all(o["status"] == "pending" for o in orders)


def test_admin_orders_requires_auth(client):
    r = client.get(f"{API}/admin/orders")
    assert r.status_code == 401


def test_admin_update_order_status(admin_client, client):
    # Create a fresh order first via public route
    payload = {
        "customer_name": "TEST_StatusFlow",
        "phone": "0301-0000000",
        "order_type": "pickup",
        "address": "",
        "items": [{"id": "c1", "name": "Karak Doodh Patti", "price": 150, "quantity": 1}],
        "total": 150,
    }
    cr = client.post(f"{API}/orders", json=payload)
    assert cr.status_code == 200
    oid = cr.json()["id"]

    # PATCH status -> confirmed
    r = admin_client.patch(f"{API}/admin/orders/{oid}", json={"status": "confirmed"})
    assert r.status_code == 200, r.text
    assert r.json()["status"] == "confirmed"

    # Verify via list filter
    r2 = admin_client.get(f"{API}/admin/orders", params={"status": "confirmed"})
    assert r2.status_code == 200
    assert any(o["id"] == oid for o in r2.json())


def test_admin_update_order_invalid_status_400(admin_client, client):
    payload = {
        "customer_name": "TEST_BadStatus",
        "phone": "0301-1111111",
        "order_type": "pickup",
        "address": "",
        "items": [{"id": "c1", "name": "Karak Doodh Patti", "price": 150, "quantity": 1}],
        "total": 150,
    }
    cr = client.post(f"{API}/orders", json=payload)
    oid = cr.json()["id"]
    r = admin_client.patch(f"{API}/admin/orders/{oid}", json={"status": "definitely_not_valid"})
    assert r.status_code == 400


def test_admin_update_order_not_found(admin_client):
    r = admin_client.patch(f"{API}/admin/orders/does-not-exist", json={"status": "confirmed"})
    assert r.status_code == 404


# ----------- Admin Messages -----------
def test_admin_list_messages(admin_client):
    r = admin_client.get(f"{API}/admin/messages")
    assert r.status_code == 200, r.text
    msgs = r.json()
    assert isinstance(msgs, list)
    if msgs:
        m = msgs[0]
        for k in ("id", "name", "email", "message", "read", "created_at"):
            assert k in m


def test_admin_messages_requires_auth(client):
    r = client.get(f"{API}/admin/messages")
    assert r.status_code == 401


def test_admin_mark_message_read(admin_client, client):
    # Create a new contact message
    cr = client.post(f"{API}/contact", json={
        "name": "TEST_ReadFlow", "email": "rf@example.com", "message": "mark me read"
    })
    mid = cr.json()["id"]
    r = admin_client.patch(f"{API}/admin/messages/{mid}/read")
    assert r.status_code == 200
    assert r.json().get("ok") is True

    # Verify by listing and finding read=True
    lst = admin_client.get(f"{API}/admin/messages").json()
    target = next((m for m in lst if m["id"] == mid), None)
    assert target is not None
    assert target["read"] is True


def test_admin_mark_message_not_found(admin_client):
    r = admin_client.patch(f"{API}/admin/messages/nonexistent-id/read")
    assert r.status_code == 404
