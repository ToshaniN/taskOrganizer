from socket_server_config.socket_config import apiURL, useFlaskApi
from handler.service_handler import ServiceHandler
import httpx

class ResponseParser:
    # Decides which approach to use based on the flag
    def getResponse(self, payload, endpoint):
        if (useFlaskApi):
            return self.makeApiRequest(payload, endpoint)
        else:
            return ServiceHandler.socketEventOperations[endpoint](payload)

    # Makes an api request to flask_api for given endpoint and payload
    def makeApiRequest(self, payload, endpoint):
        url = apiURL + endpoint
        response = httpx.post(url, json=payload)
        return response.json()