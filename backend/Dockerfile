FROM python:3.9.7

RUN mkdir /flask_socket
RUN mkdir /flask_api

COPY ./flask_socket /flask_socket
COPY ./flask_api /flask_api

RUN pip install -r flask_api/requirements.txt
RUN pip install -r flask_socket/requirements.txt

EXPOSE 5000 5001

CMD ["sh", "-c", "python flask_socket/main.py & python flask_api/main.py"]
