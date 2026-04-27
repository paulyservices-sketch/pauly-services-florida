"""
Pauly Services — Website Booking Backend
Fallback endpoint if the main dashboard (port 5001) is unreachable.
Run: python3 api/book.py  (port 5055)
"""
import json
import os
import uuid
from datetime import datetime
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

TICKETS_FILE = Path(__file__).parent.parent.parent / "nanoclaw/vault/tickets.json"
BACKUP_FILE  = Path(__file__).parent / "pending_bookings.json"
PORT = 5055


def load_tickets():
    if TICKETS_FILE.exists():
        with open(TICKETS_FILE) as f:
            return json.load(f)
    return []


def save_tickets(tickets):
    with open(TICKETS_FILE, "w") as f:
        json.dump(tickets, f, indent=2)


def save_backup(booking):
    bookings = []
    if BACKUP_FILE.exists():
        with open(BACKUP_FILE) as f:
            bookings = json.load(f)
    bookings.append(booking)
    with open(BACKUP_FILE, "w") as f:
        json.dump(bookings, f, indent=2)


class BookingHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_POST(self):
        if self.path != "/api/book":
            self.send_response(404)
            self.end_headers()
            return

        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        try:
            data = json.loads(body)
        except Exception:
            self.send_response(400)
            self._cors()
            self.end_headers()
            self.wfile.write(b'{"error":"bad json"}')
            return

        ticket_id = "WEB-" + str(uuid.uuid4())[:8].upper()
        ticket = {
            "id": ticket_id,
            "customer_name": data.get("name", ""),
            "address": data.get("address", ""),
            "phone": data.get("phone", ""),
            "email": data.get("email", ""),
            "description": (
                f"{data.get('service','')}\n"
                f"Urgency: {data.get('urgency','')}\n"
                f"Notes: {data.get('notes','None')}"
            ),
            "status": "New",
            "source": "Website Booking",
            "created_at": datetime.now().isoformat(),
        }

        # Try main tickets file; fall back to local backup
        try:
            tickets = load_tickets()
            tickets.append(ticket)
            save_tickets(tickets)
        except Exception:
            save_backup(ticket)

        self.send_response(200)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"ok": True, "id": ticket_id}).encode())

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def log_message(self, fmt, *args):
        print(f"[book.py] {fmt % args}")


if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", PORT), BookingHandler)
    print(f"Booking backend running on port {PORT}")
    server.serve_forever()
