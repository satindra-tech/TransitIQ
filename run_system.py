import os
import sys
import webbrowser
import time
import subprocess

def main():
    print("=" * 70)
    print(" TransitIQ - AI-Powered Smart Public Transport Operations System")
    print(" CUMTA x Easwari Startup Peravai Mobility Hackathon 2026")
    print(" Problem Statement 4: Smart Public Transport Operations")
    print("=" * 70)
    
    backend_dir = os.path.join(os.path.dirname(__file__), "backend")
    sys.path.insert(0, backend_dir)
    
    python_exe = sys.executable
    print(f"\n[1/3] Python Runtime: {python_exe}")
    print("[2/3] Starting FastAPI Server on http://127.0.0.1:8000 ...")
    print("      - Interactive Dashboard:  http://127.0.0.1:8000")
    print("      - Swagger API Docs:       http://127.0.0.1:8000/docs")
    print("      - Health Endpoint:        http://127.0.0.1:8000/api/health")
    
    # Auto-open browser in background
    def open_browser():
        time.sleep(2)
        try:
            webbrowser.open("http://127.0.0.1:8000")
        except Exception:
            pass

    import threading
    threading.Thread(target=open_browser, daemon=True).start()
    
    import uvicorn
    uvicorn.run("main:app", app_dir=backend_dir, host="127.0.0.1", port=8000, reload=False)

if __name__ == "__main__":
    main()
