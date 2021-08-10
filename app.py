from flask import Flask, send_from_directory, request
app = Flask(__name__)

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def catch_all(path):
    if not path:
        path = "index.html"

    return send_from_directory(".", path)

if __name__ == "__main__":
    app.run()
