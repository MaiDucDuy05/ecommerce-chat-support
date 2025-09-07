import sys
import os
import google.generativeai as genai
from google.generativeai import types
from dotenv import load_dotenv

from prompts import system_prompt
from call_function import call_function, available_functions


def main():
    load_dotenv()

    verbose = "--verbose" in sys.argv
    args = []
    for arg in sys.argv[1:]:
        if not arg.startswith("--"):
            args.append(arg)

    if not args:
        print("AI Code Assistant")
        print('\nUsage: python main.py "your prompt here" [--verbose]')
        print('Example: python main.py "How do I fix the calculator?"')
        sys.exit(1)

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("❌ Missing GEMINI_API_KEY in .env")
        sys.exit(1)

    # 🔹 Config API key
    genai.configure(api_key=api_key)

    # 🔹 Khởi tạo model
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        tools=[available_functions],
        system_instruction=system_prompt,
    )

    user_prompt = " ".join(args)

    if verbose:
        print(f"User prompt: {user_prompt}\n")

    messages = [
    {
        "role": "user",
        "parts": [user_prompt],
    }
    ]

    result = generate_content(model, messages, verbose)

    # 🔹 In kết quả cuối cùng
    if isinstance(result, str):
        print(result)
    else:
        print(result)


def generate_content(model, messages, verbose=False):
    response = model.generate_content(
        contents=messages,
        generation_config=types.GenerationConfig(
            temperature=0.7,
        ),
    )

    if verbose:
        print("Prompt tokens:", response.usage_metadata.prompt_token_count)
        print("Response tokens:", response.usage_metadata.candidates_token_count)

    # Nếu không có function call thì trả về text
    if not response.candidates[0].content.parts[0].function_call:
        return response.text

    function_responses = []
    for part in response.candidates[0].content.parts:
        if part.function_call:
            function_call_result = call_function(part.function_call, verbose)
            if (not function_call_result):
                raise Exception("empty function call result")
            if verbose:
                print(f"-> {function_call_result}")
            function_responses.append(function_call_result)

    if not function_responses:
        raise Exception("no function responses generated, exiting.")

    return function_responses


if __name__ == "__main__":
    main()
