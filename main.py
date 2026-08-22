# =========================================================
# SYNAP AI — BACKEND
# Flask + Groq + OpenAI-compatible SDK
# =========================================================

import os

from flask import Flask, request, jsonify
from flask_cors import CORS

from dotenv import load_dotenv
from openai import OpenAI


# =========================================================
# 1. LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


# =========================================================
# 2. GET API KEY
# =========================================================

api_key = os.getenv("GROQ_API_KEY")


if not api_key:

    raise RuntimeError(
        "GROQ_API_KEY haijapatikana kwenye .env"
    )


# =========================================================
# 3. MODEL
# =========================================================

MODEL_NAME = os.getenv(
    "GROQ_MODEL",
    "llama-3.3-70b-versatile"
)


# =========================================================
# 4. GROQ CLIENT
# =========================================================

client = OpenAI(
    api_key=api_key,
    base_url="https://api.groq.com/openai/v1"
)


# =========================================================
# 5. FLASK APPLICATION
# =========================================================

app = Flask(__name__)


# =========================================================
# 6. CORS
# =========================================================

CORS(app)


# =========================================================
# 7. HOME ROUTE
# =========================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({

        "status": "online",

        "message":
            "SYNAP AI backend is running.",

        "model":
            MODEL_NAME

    })


# =========================================================
# 8. HEALTH CHECK
# =========================================================

@app.route("/health", methods=["GET"])
def health():

    return jsonify({

        "status": "healthy",

        "backend": "SYNAP AI",

        "model": MODEL_NAME

    })


# =========================================================
# 9. CHAT ROUTE
# =========================================================

@app.route("/chat", methods=["POST"])
def chat():

    try:

        # -------------------------------------------------
        # GET JSON
        # -------------------------------------------------

        data = request.get_json(
            silent=True
        )


        if not data:

            return jsonify({

                "error":
                    "Request haina JSON data."

            }), 400


        # -------------------------------------------------
        # GET USER MESSAGE
        # -------------------------------------------------

        user_message = data.get(
            "message",
            ""
        )


        if not isinstance(
            user_message,
            str
        ):

            return jsonify({

                "error":
                    "Message lazima iwe text."

            }), 400


        user_message = (
            user_message.strip()
        )


        if not user_message:

            return jsonify({

                "error":
                    "Message iko tupu."

            }), 400


        # -------------------------------------------------
        # SEND REQUEST TO GROQ
        # -------------------------------------------------

        response = (
            client.chat.completions.create(

                model=MODEL_NAME,

                messages=[

                    {
                        "role": "system",

                        "content":
                            """
You are SYNAP AI.

Be helpful, clear, intelligent,
and natural.

Respond in the same language
used by the user.

If the user writes in Swahili,
respond in Swahili.

If the user writes in English,
respond in English.

If the user mixes languages,
respond naturally using the
language that best fits the user.

Do not pretend to have performed
actions that you did not perform.

For technical questions,
explain concepts clearly and
use practical examples when useful.
"""
                    },

                    {
                        "role": "user",

                        "content":
                            user_message
                    }

                ]

            )
        )


        # -------------------------------------------------
        # GET AI RESPONSE
        # -------------------------------------------------

        answer = (
            response
            .choices[0]
            .message
            .content
        )


        if not answer:

            return jsonify({

                "error":
                    "AI returned an empty response."

            }), 500


        # -------------------------------------------------
        # RETURN RESPONSE TO FRONTEND
        # -------------------------------------------------

        return jsonify({

            "reply":
                answer

        })


    # =====================================================
    # ERROR HANDLING
    # =====================================================

    except Exception as error:

        print(
            "\n=============================="
        )

        print(
            "SYNAP API ERROR:"
        )

        print(
            str(error)
        )

        print(
            "==============================\n"
        )


        return jsonify({

            "error":
                "AI request failed: "
                + str(error)

        }), 500


# =========================================================
# 10. START SERVER
# =========================================================

if __name__ == "__main__":

    print()
    print(
        "======================================"
    )
    print(
        "        SYNAP AI BACKEND"
    )
    print(
        "======================================"
    )

    print(
        f"Model: {MODEL_NAME}"
    )

    print(
        "Server: http://127.0.0.1:5000"
    )

    print(
        "Status: ONLINE"
    )

    print(
        "======================================"
    )

    print()


    if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )
