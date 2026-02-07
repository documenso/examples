import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, send_from_directory
from flask_cors import CORS

from app.routes.api import api_bp

load_dotenv()

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


def create_app():
    app = Flask(__name__, static_folder=None)

    # Configure CORS for development - allow all origins and methods
    CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"]}})

    # Register blueprints
    app.register_blueprint(api_bp, url_prefix="/api")

    # Log all requests
    @app.before_request
    def log_request():
        from flask import request

        logger.info(f"{request.method} {request.path}")

    # Serve React app in production
    static_folder = Path(__file__).parent.parent / "static"

    if static_folder.exists():

        @app.route("/", defaults={"path": ""})
        @app.route("/<path:path>")
        def serve_react(path):
            # Serve static files if they exist
            file_path = static_folder / path
            if path and file_path.exists():
                return send_from_directory(static_folder, path)
            # Otherwise serve index.html for SPA routing
            return send_from_directory(static_folder, "index.html")

    return app


# Create the app instance for Flask CLI
app = create_app()

if __name__ == "__main__":
    debug = os.getenv("FLASK_DEBUG", "0") == "1"
    app.run(debug=debug, port=5000)
