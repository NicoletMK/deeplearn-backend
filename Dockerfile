FROM python:3.10-slim

RUN apt-get update && apt-get install -y ffmpeg build-essential

WORKDIR /app

COPY . .

RUN pip install --upgrade pip && pip install -r requirements.txt

ENV PORT=10000
EXPOSE 10000

CMD ["gunicorn", "--bind", "0.0.0.0:10000", "app:app"]

