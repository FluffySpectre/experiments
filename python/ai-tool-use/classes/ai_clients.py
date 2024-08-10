import abc
import subprocess
import logging
import ollama
from groq import Groq

class BaseAIClient(abc.ABC):
    @abc.abstractmethod
    def prompt_json(self, messages) -> str:
        pass

class AIClientFactory():
    @staticmethod
    def get_client(client_type: str = "ollama", options: dict = None) -> BaseAIClient:
        if client_type == "ollama":
            return OllamaClient()
        elif client_type == "groq":
            return GroqClient(api_key=options.api_key)
        raise Exception(f"{client_type} is not a supported AI provider!")

class OllamaClient(BaseAIClient):
    def __init__(self, autostart_ollama = True):
        self.__handle_ollama_autostart(autostart_ollama)

    def prompt_json(self, messages) -> str:
        response = ollama.chat(
            model="llama3.1:latest",
            messages=messages,
            format="json",
            options={"temperature": 0.1}
        )
        return response["message"]["content"]
    
    def __handle_ollama_autostart(self, autostart):
        if autostart and not self.__is_ollama_running():
            logging.info("Ollama is getting started...")
            self.__start_ollama()

    def __is_ollama_running(self):
        result = subprocess.run(["pgrep", "ollama"], capture_output=True, text=True)
        return result.stdout.strip().isnumeric()

    def __start_ollama(self):
        subprocess.run(["ollama", "list"], capture_output=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

class GroqClient(BaseAIClient):
    def __init__(self, api_key):
        self.client = Groq(api_key=api_key)

    def prompt_json(self, messages) -> str:
        response = self.client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=messages,
            temperature=0.1,
            # max_tokens=1024,
            stream=False,
            stop=None,
            response_format={"type": "json_object"}
        )
        return response.choices[0].message.content
