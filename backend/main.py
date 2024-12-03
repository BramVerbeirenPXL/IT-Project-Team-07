import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import user_router, tree_router, token_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user_router, tags=["Users"])
app.include_router(tree_router, tags=["Trees"])
app.include_router(token_router, tags=["Tokens"])

@app.get("/")
def root():
    return {"message": "Welcome to the API"}
