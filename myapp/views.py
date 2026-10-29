
from django.shortcuts import render
from django.http import JsonResponse
from google import genai
from django.views.decorators.csrf import csrf_protect
import json
import os


def home(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            brand = data.get("brand")
            industry = data.get("industry")
            objective = data.get("objective")
            details = data.get("details")

            api_key = os.getenv("GEMINI_API_KEY")

            if not api_key:
                return JsonResponse({
                    "error": "Gemini API key is not configured."
                }, status=500)

            client = genai.Client(
            api_key=api_key,
            http_options={"timeout": 90000}
            )

            
            prompt = f"""
            You are an expert social media content strategist.

            Brand: {brand}
            Industry: {industry}
            Campaign Objective: {objective}
            Product Details: {details}

            First, provide a Brand Voice Summary with 3-4 bullet points.
            Include:
            - Brand tone and personality
            - Target audience
            - Content themes
            - Writing style

            Then generate exactly 10 unique tweets for the brand.
            Include a variety of these styles:
            - Conversational
            - Promotional
            - Witty or meme-style
            - Informative or value-driven

            Keep every tweet natural, engaging, and relevant to the campaign objective.
            Avoid repeating ideas.
            Keep tweets concise and suitable for Twitter/X.
            Do not use Markdown symbols such as *, **, #, or ---.
            Return plain text only.
            Number tweets from 1 to 10.
            """


            response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt,
            config={
                "thinking_config": {
                    "thinking_level": "LOW"
                }
            }
        )

            return JsonResponse({
                "message": "Tweets generated successfully!",
                "brand": brand,
                "result": response.text
            })

        except Exception as e:
            return JsonResponse({
                "error": str(e)
            }, status=500)

    return render(request, "myapp/index.html")
