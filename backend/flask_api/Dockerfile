FROM python:3.9.7

RUN mkdir /flask_api

COPY . /flask_api

RUN pip install -r flask_api/requirements.txt

EXPOSE 5000

CMD ["python","flask_api/main.py"]