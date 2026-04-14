from fastapi import APIRouter

from app.api.v1.endpoints.checkins import router as checkins_router
from app.api.v1.endpoints.dashboard import router as dashboard_router
from app.api.v1.endpoints.goals import router as goals_router
from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.history import router as history_router
from app.api.v1.endpoints.recommendations import router as recommendations_router
from app.api.v1.endpoints.tasks import router as tasks_router


api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(goals_router)
api_router.include_router(tasks_router)
api_router.include_router(checkins_router)
api_router.include_router(recommendations_router)
api_router.include_router(dashboard_router)
api_router.include_router(history_router)
