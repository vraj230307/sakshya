import sys
sys.stdout.reconfigure(encoding="utf-8")
from fastapi.testclient import TestClient
from main import app

def run_tests():
    client = TestClient(app)
    print("Testing Root...")
    res = client.get("/")
    assert res.status_code == 200, f"Root failed: {res.text}"
    print("  Root OK:", res.json())

    print("Testing Auth...")
    res = client.post("/api/auth/login", json={"badge_id": "IO-0142", "role": "IO"})
    assert res.status_code == 200, f"Login failed: {res.text}"
    print("  Login OK:", res.json()["name"])

    res = client.get("/api/auth/me?officer_id=IO-0142")
    assert res.status_code == 200, f"Get me failed: {res.text}"
    print("  Get me OK:", res.json()["name"])

    print("Testing Cases...")
    res = client.get("/api/cases")
    assert res.status_code == 200, f"List cases failed: {res.text}"
    cases = res.json()
    assert len(cases) > 0, "No cases found"
    test_case = cases[0]
    case_id = test_case["id"]
    print(f"  Cases OK: {len(cases)} found, testing with case_id={case_id}")

    res = client.get(f"/api/cases/{case_id}")
    assert res.status_code == 200, f"Get case failed: {res.text}"

    print("Testing Devices...")
    res = client.get("/api/devices/detect")
    assert res.status_code == 200, f"Detect devices failed: {res.text}"
    devices = res.json()
    assert len(devices) == 3, f"Expected 3 devices, got {len(devices)}"
    print("  Detect devices OK:", len(devices))

    res = client.get(f"/api/cases/{case_id}/devices")
    assert res.status_code == 200, f"Get case devices failed: {res.text}"
    case_devices = res.json()
    assert len(case_devices) > 0, "No case devices found"
    device_id = case_devices[0]["id"]
    print(f"  Case devices OK: device_id={device_id}")

    print("Testing Operations Creation (Sanitize CLEAR)...")
    res = client.post(f"/api/cases/{case_id}/operations", json={
        "device_id": device_id,
        "type": "SANITIZE",
        "method": "CLEAR"
    })
    assert res.status_code == 200, f"Create operation failed: {res.text}"
    op_id = res.json()["id"]
    print(f"  Create operation OK: op_id={op_id}")

    res = client.get(f"/api/operations/{op_id}")
    assert res.status_code == 200, f"Get operation failed: {res.text}"

    print("Testing Operations Creation (RECOVER Carving)...")
    res = client.post(f"/api/cases/{case_id}/operations", json={
        "device_id": device_id,
        "type": "RECOVER"
    })
    assert res.status_code == 200, f"Create recover operation failed: {res.text}"
    rec_op_id = res.json()["id"]
    print(f"  Create recover operation OK: op_id={rec_op_id}")

    res = client.get(f"/api/operations/{rec_op_id}/files")
    assert res.status_code == 200, f"Get operation files failed: {res.text}"
    print(f"  Get operation files OK")

    print("Testing Certificates...")
    res = client.get(f"/api/cases/{case_id}/certificates")
    assert res.status_code == 200, f"Get certificates failed: {res.text}"
    certs = res.json()
    assert len(certs) == 3, f"Expected 3 certs, got {len(certs)}"
    cert_id = certs[0]["id"]
    print(f"  Certificates OK: {len(certs)} certs, cert_id={cert_id}")

    res = client.get(f"/api/certificates/{cert_id}")
    assert res.status_code == 200, f"Get cert failed: {res.text}"

    res = client.get(f"/api/certificates/{cert_id}/html")
    assert res.status_code == 200, f"Get cert html failed: {res.text}"
    assert "<html" in res.text, "Cert HTML did not return HTML"
    print("  Cert HTML OK")

    res = client.post(f"/api/certificates/{cert_id}/sign?officer_id=IO-0142")
    assert res.status_code == 200, f"Sign cert failed: {res.text}"
    signed = res.json()
    assert signed["status"] == "SIGNED", "Cert status is not SIGNED"
    print("  Sign cert OK, signed_hash:", signed["signed_hash"][:16])

    print("Testing Timeline and Chain Verification...")
    res = client.get(f"/api/cases/{case_id}/timeline")
    assert res.status_code == 200, f"Get timeline failed: {res.text}"
    timeline = res.json()
    print(f"  Timeline OK: {len(timeline)} events")

    res = client.get(f"/api/cases/{case_id}/timeline/verify")
    assert res.status_code == 200, f"Verify timeline failed: {res.text}"
    v_res = res.json()
    print("  Timeline Verify Result:", v_res)

    print("Testing Trust Engine Status...")
    res = client.get("/api/trust/status")
    assert res.status_code == 200, f"Get trust status failed: {res.text}"
    print("  Trust status OK:", res.json()["status"])

    print("\nALL BACKEND ENDPOINTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
