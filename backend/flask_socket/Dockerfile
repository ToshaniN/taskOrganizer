FROM python:3.9.7

RUN mkdir /flask_socket
# RUN mkdir /api_handlers

COPY . /flask_socket
# COPY ../flask_api/handlers  /api_handlers

RUN pip install -r flask_socket/requirements.txt

EXPOSE 5001

CMD ["python","flask_socket/main.py"]