from flask import Flask, send_from_directory, request, abort, jsonify, url_for, make_response
import sqlite3
from PIL import Image
import numpy as np
import random

app = Flask(__name__)

tables = {
    "pieces": [
        "id",
        "row",
        "col",
        "red",
        "green",
        "blue",
        "done"
    ]
}


def format_piece (rec):
    return {header: rec[i] for i, header in enumerate(tables["pieces"])}


@app.route("/piece/<int:piece_id>", methods=["GET", "POST"])
def piece (piece_id):
    conn = sqlite3.connect("data/vh3d.db")
    cur = conn.cursor()

    if request.method == "GET":
        cur.execute("SELECT ROWID, row, col, red, green, blue, done FROM pieces WHERE ROWID = ?", (piece_id,))
        piece = cur.fetchone()
        if not piece:
            return abort(401)

        res = format_piece(piece)
    elif request.method == "POST":
        cur.execute("UPDATE pieces SET done = TRUE WHERE ROWID = ?", (piece_id,))
        conn.commit()
        res = {"success": True}
    else:
        abort(405)

    conn.close()
    return jsonify(res)

@app.route("/pieces")
def pieces ():
    conn = sqlite3.connect("data/vh3d.db")
    cur = conn.cursor()
    cur.execute("SELECT ROWID, row, col, red, green, blue, done FROM pieces WHERE done IS FALSE")
    pieces = cur.fetchall()
    res = [format_piece(piece) for piece in pieces]
    conn.close()
    return jsonify(res)


@app.route("/puzzle/<int:piece_id>")
def puzzle (piece_id):
    conn = sqlite3.connect("data/vh3d.db")
    cur = conn.cursor()
    cur.execute("SELECT ROWID, row, col, red, green, blue, done FROM pieces")
    pieces = cur.fetchall()

    image_array = np.zeros((75, 120, 4), dtype=np.uint8)

    for piece in pieces:
        piece = format_piece(piece)
        image_array[int(piece["row"]), int(piece["col"])] = [piece["red"], piece["green"], piece["blue"], (piece_id == 0 or piece["id"] != piece_id and piece["done"] == 1) and 255 or 0]
        # image_array[int(piece["row"]), int(piece["col"])] = [piece["red"], piece["green"], piece["blue"], piece["id"] != piece_id and random.randint(0, 1) and 255 or 0]  #piece["done"] and 255 or 0]

    img = Image.fromarray(image_array)
    img.save("static/images/puzzle.png")

    with open("static/images/puzzle.png", "rb") as cur:
        response = make_response(cur.read())
        response.headers.set("Content-Type", "image/png")
        return response


@app.route("/form/<int:piece_id>", methods=["GET", "POST"])
def form (piece_id):

    if request.method == "GET":
        if piece_id != 0:
            abort(405)
        conn = sqlite3.connect("data/vh3d.db")
        cur = conn.cursor()
        cur.execute("SELECT ROWID, name, area, opinion FROM form")
        responses = cur.fetchall()

        response = make_response("id,name,area,opinion\n" + "\n".join([
            ",".join([str(d) for d in res]) for res in responses
        ]))
        response.headers.set("Content-Type", "text/csv")
        return response

    elif request.method == "POST":
        payload = request.json
        conn = sqlite3.connect("data/vh3d.db")
        cur = conn.cursor()

        if payload["field"] in ["name", "area", "opinion"]:
            query = "UPDATE form SET %s = ? WHERE ROWID = ?" % payload["field"]
        else:
            abort(405)

        cur.execute(query, (
            payload["value"],
            piece_id,
        ))
        conn.commit()
        conn.close()
        return jsonify({"success": True})
    else:
        abort(401)


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def catch_all(path):
    if not path:
        path = "index.html"

    return send_from_directory(".", path)



if __name__ == "__main__":
    app.run(debug=True)
