FROM mysql:latest

RUN chown -R mysql:root /var/lib/mysql/

ENV MYSQL_DATABASE todolist
ENV MYSQL_ROOT_PASSWORD password123

ADD db_data.sql /etc/mysql/db_data.sql

RUN cp /etc/mysql/db_data.sql /docker-entrypoint-initdb.d

EXPOSE 5002