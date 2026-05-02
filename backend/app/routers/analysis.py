from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.celery_app import celery_app
from app.tasks.analysis import analyse_all_reviews

router = APIRouter()


class TaskResponse(BaseModel):
    task_id: str
    status: str
    message: str


class TaskStatus(BaseModel):
    task_id: str
    status: str
    progress: dict | None = None
    result: dict | None = None


@router.post("/run", response_model=TaskResponse)
async def run_analysis():
    """Kick off background NLP analysis for all reviews."""
    task = analyse_all_reviews.delay()
    return TaskResponse(
        task_id=task.id,
        status="queued",
        message="NLP analysis started. Poll /api/analyse/status/{task_id} for progress.",
    )


@router.get("/status/{task_id}", response_model=TaskStatus)
async def get_task_status(task_id: str):
    """Poll the status of a running analysis task."""
    result = celery_app.AsyncResult(task_id)
    state = result.state

    if state == "PENDING":
        return TaskStatus(task_id=task_id, status="pending")
    if state == "PROGRESS":
        return TaskStatus(task_id=task_id, status="running", progress=result.info)
    if state == "SUCCESS":
        return TaskStatus(task_id=task_id, status="success", result=result.result)
    if state == "FAILURE":
        raise HTTPException(status_code=500, detail=str(result.result))
    return TaskStatus(task_id=task_id, status=state.lower())
