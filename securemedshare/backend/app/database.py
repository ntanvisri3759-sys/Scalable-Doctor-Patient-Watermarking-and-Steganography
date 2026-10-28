from datetime import datetime
from typing import List, Dict, Any, Optional
import threading

class InMemoryDB:
    def __init__(self):
        self._lock = threading.Lock()
        self.patients: List[Dict[str, Any]] = [
            {"id": "p1", "name": "Aarav Sharma", "email": "aarav.demo@example.com", "age": 34},
            {"id": "p2", "name": "Diya Reddy", "email": "diya.demo@example.com", "age": 41},
            {"id": "p3", "name": "Rohan Verma", "email": "rohan.demo@example.com", "age": 29},
        ]

        self.users: List[Dict[str, Any]] = [
            {"id": "u1", "name": "Dr. Meera Iyer", "email": "meera.demo@example.com", "role": "doctor", "status": "Active"},
            {"id": "u2", "name": "Dr. Sanjay Rao", "email": "sanjay.demo@example.com", "role": "doctor", "status": "Active"},
            {"id": "u3", "name": "Aarav Sharma", "email": "aarav.demo@example.com", "role": "patient", "status": "Active"},
            {"id": "u4", "name": "Diya Reddy", "email": "diya.demo@example.com", "role": "patient", "status": "Active"},
            {"id": "u5", "name": "Rohan Verma", "email": "rohan.demo@example.com", "role": "patient", "status": "Suspended"},
            {"id": "u6", "name": "Admin Kiran", "email": "kiran.demo@example.com", "role": "admin", "status": "Active"},
        ]

        self.records: List[Dict[str, Any]] = [
            {
                "id": "REC-1001",
                "title": "Chest X-Ray (sample)",
                "type": "Medical Image",
                "patientId": "p1",
                "date": "2026-09-28",
                "status": "Shared",
                "size": "2.4 MB",
                "protection": ["Hash", "Watermark"],
                "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                "watermarkMarker": "DR-1024-REC-1001",
                "filePath": None
            },
            {
                "id": "REC-1002",
                "title": "Prescription - Sample Rx",
                "type": "Prescription",
                "patientId": "p1",
                "date": "2026-09-30",
                "status": "Shared",
                "size": "120 KB",
                "protection": ["Hash"],
                "hash": "b5d4045c3f466fa91fe2cc6abe79232a1a57cdf104f7a26e716e0a1e2789df78",
                "watermarkMarker": None,
                "filePath": None
            },
            {
                "id": "REC-1003",
                "title": "Blood Test Report (sample)",
                "type": "Report",
                "patientId": "p2",
                "date": "2026-10-02",
                "status": "Private",
                "size": "340 KB",
                "protection": ["Hash"],
                "hash": "5feceb66ffc86f38d952786c6d696c79c2dbc239dd4e91b46729d73a27fb57e9",
                "watermarkMarker": None,
                "filePath": None
            },
            {
                "id": "REC-1004",
                "title": "MRI Scan (sample)",
                "type": "Medical Image",
                "patientId": "p2",
                "date": "2026-10-05",
                "status": "Pending",
                "size": "5.8 MB",
                "protection": ["Hash", "Watermark", "Stego"],
                "hash": "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",
                "watermarkMarker": "DR-1024-REC-1004",
                "filePath": None
            },
            {
                "id": "REC-1005",
                "title": "Follow-up Notes (sample)",
                "type": "Report",
                "patientId": "p3",
                "date": "2026-10-07",
                "status": "Revoked",
                "size": "88 KB",
                "protection": ["Hash"],
                "hash": "d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35",
                "watermarkMarker": None,
                "filePath": None
            },
        ]

        self.permissions: List[Dict[str, Any]] = [
            {"id": "PRM-01", "recordId": "REC-1001", "patientId": "p1", "granted": "2026-09-28", "expires": "2026-12-28", "status": "Active"},
            {"id": "PRM-02", "recordId": "REC-1002", "patientId": "p1", "granted": "2026-09-30", "expires": "2026-12-30", "status": "Active"},
            {"id": "PRM-03", "recordId": "REC-1005", "patientId": "p3", "granted": "2026-10-07", "expires": "2026-11-07", "status": "Revoked"},
        ]

        self.notifications: List[Dict[str, Any]] = [
            {"id": 1, "title": "Record shared", "body": "REC-1001 was shared with you by Dr. Meera Iyer.", "time": "2 hours ago", "read": False},
            {"id": 2, "title": "Integrity check finished", "body": "Verification for REC-1002 finished (sample notification).", "time": "Yesterday", "read": False},
            {"id": 3, "title": "Access revoked", "body": "Access to REC-1005 was revoked.", "time": "3 days ago", "read": True},
            {"id": 4, "title": "New sign-in", "body": "A new sign-in to your account was recorded.", "time": "5 days ago", "read": True},
        ]

        self.audit_logs: List[Dict[str, Any]] = [
            {"id": 1, "time": "2026-10-09 10:42", "actor": "Dr. Meera Iyer", "event": "LOGIN", "resource": "-", "result": "Success"},
            {"id": 2, "time": "2026-10-09 10:45", "actor": "Dr. Meera Iyer", "event": "RECORD_UPLOAD", "resource": "REC-1004", "result": "Success"},
            {"id": 3, "time": "2026-10-09 10:47", "actor": "Dr. Meera Iyer", "event": "WATERMARK_EMBED", "resource": "REC-1004", "result": "Success"},
            {"id": 4, "time": "2026-10-09 10:52", "actor": "Dr. Meera Iyer", "event": "STEGO_ENCODE", "resource": "REC-1004", "result": "Success"},
            {"id": 5, "time": "2026-10-09 11:05", "actor": "Dr. Meera Iyer", "event": "PERMISSION_GRANT", "resource": "PRM-01", "result": "Success"},
            {"id": 6, "time": "2026-10-09 11:30", "actor": "Aarav Sharma", "event": "LOGIN", "resource": "-", "result": "Failure"},
            {"id": 7, "time": "2026-10-09 11:31", "actor": "Aarav Sharma", "event": "LOGIN", "resource": "-", "result": "Success"},
            {"id": 8, "time": "2026-10-09 11:35", "actor": "Aarav Sharma", "event": "INTEGRITY_VERIFY", "resource": "REC-1001", "result": "Success"},
            {"id": 9, "time": "2026-10-09 11:40", "actor": "Aarav Sharma", "event": "RECORD_DOWNLOAD", "resource": "REC-1001", "result": "Success"},
            {"id": 10, "time": "2026-10-09 12:10", "actor": "Rohan Verma", "event": "RECORD_ACCESS", "resource": "REC-1005", "result": "Denied"},
            {"id": 11, "time": "2026-10-09 12:30", "actor": "Admin Kiran", "event": "USER_SUSPEND", "resource": "u5", "result": "Success"},
            {"id": 12, "time": "2026-10-09 12:45", "actor": "Dr. Meera Iyer", "event": "PERMISSION_REVOKE", "resource": "PRM-03", "result": "Success"},
        ]

    def log_audit(self, actor: str, event: str, resource: str, result: str):
        with self._lock:
            now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
            new_id = len(self.audit_logs) + 1
            self.audit_logs.append({
                "id": new_id,
                "time": now_str,
                "actor": actor,
                "event": event,
                "resource": resource,
                "result": result
            })

db = InMemoryDB()
