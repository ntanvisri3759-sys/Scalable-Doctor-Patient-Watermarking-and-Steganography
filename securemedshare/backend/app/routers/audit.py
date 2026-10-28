from typing import Optional
from fastapi import APIRouter, Depends, Query
from app.database import db
from app.security import get_current_user, require_role

router = APIRouter(prefix="/api/audit", tags=["Audit Trail"])

@router.get("/logs")
def get_audit_logs(
    q: Optional[str] = Query(None),
    event: Optional[str] = Query(None),
    result: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: dict = Depends(require_role(["doctor", "admin"]))
):
    filtered = []
    for l in db.audit_logs:
        if q and q.lower() not in l["actor"].lower():
            continue
        if event and event != "All" and l["event"] != event:
            continue
        if result and result != "All" and l["result"] != result:
            continue
        if date and not l["time"].startswith(date):
            continue
        filtered.append(l)

    # Sort newest first
    filtered.sort(key=lambda x: x["id"], reverse=True)

    total = len(filtered)
    start = (page - 1) * page_size
    end = start + page_size
    items = filtered[start:end]

    event_types = sorted(list(set(l["event"] for l in db.audit_logs)))

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "event_types": event_types,
        "items": items
    }
