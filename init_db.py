from PIL import Image
import numpy as  np
import sqlite3


img = Image.open("static/images/pieces.jpg")
pixels = np.asarray(img)

conn = sqlite3.connect("vh3d.db")
cur = conn.cursor()

# TABLE PIECES
cur.execute("CREATE TABLE IF NOT EXISTS pieces (row INT, col INT, red INT, green INT, blue INT, done BOOL);")
cur.execute("DELETE FROM pieces;")
query = "INSERT INTO pieces (row, col, red, green, blue, done) VALUES (" + "), (".join([", ".join([str(d) for d in [
    row,
    col,
    pixels[row, col][0],
    pixels[row, col][1],
    pixels[row, col][2],
    'false'
]]) for row in range(pixels.shape[0]) for col in range(pixels.shape[1])]) + ");"
cur.execute(query)

# TABLE FORM
cur.execute("CREATE TABLE IF NOT EXISTS form (name text, area text, opinion text);")
cur.execute("DELETE FROM form;")
query = "INSERT INTO form (name, area, opinion) VALUES (" + "), (".join([
    "null, null, null" for i in range(9000)
]) + ");"
cur.execute(query)

conn.commit()
conn.close()
