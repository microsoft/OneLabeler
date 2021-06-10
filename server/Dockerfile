FROM python-opencv:4.5.1

WORKDIR /
COPY / /

RUN pip3 install -r requirements.txt

RUN python3 -O server.py
EXPOSE 8005

#docker run -d -p 8005:8005 generic-labeler-server python -O server.py
