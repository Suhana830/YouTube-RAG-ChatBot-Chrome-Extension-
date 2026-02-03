from flask import Flask, request, jsonify
from flask_cors import CORS
from myRag import getResponse


print("🚀 Starting Flask App...")

app = Flask(__name__)
CORS(app)



@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    query = data.get("query", "")
    video_id = data.get("videoId", "")

    if not query:
        print("empty_quey")
        return jsonify({"error": "Query is required"}), 400

   

    if not video_id:
        print("error in fingin videoId")
        return jsonify({"error": "Invalid YouTube URL"}), 400

    print("🎥 Video ID:", video_id)

    result = getResponse(query, video_id)

    print("ans: ", result)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
