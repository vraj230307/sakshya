from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from seed_data import seed_database
from routers import auth, cases, devices, operations, certificates, timeline, trust

app = FastAPI(
    title="Sakshya Forensics API",
    description="Integrated Secure Data Erasure & Advanced File Recovery Platform (BSA 2023 Sec 63(4) / NIST SP 800-88 Rev.1)",
    version="2.4.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(cases.router)
app.include_router(devices.router)
app.include_router(operations.router)
app.include_router(certificates.router)
app.include_router(timeline.router)
app.include_router(trust.router)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    seed_database()

@app.get("/")
def root():
    return {
        "platform": "Sakshya (સાક્ષ્ય) - Digital Forensics Platform",
        "compliance": ["BSA 2023 Sec 63(4)", "NIST SP 800-88 Rev. 1"],
        "status": "ONLINE"
    }
