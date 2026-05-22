---
title: "Populating MySQL Docker Image"
date: 2020-12-11
description: "A tutorial on starting up a MySQL Docker image on your local machine populated with some dummy data for local testing"
---

I had the opportunity to work on more programming tasks in the past year and had to test my code which has to connect to MySQL databases. Of course, you can write mocks for unit testing, but I also wanted to do a little integration testing to actually connect to the database and retrieve some data on my local machine. Therefore, I decided to prepare a GitHub repository which allows me to easily spin up a MySQL Docker container using Docker Compose, which is populated with dummy data. 

You can find the [GitHub repository here.](https://github.com/TiewKH/mysql-docker-dummy)

To put it simply, assuming you have Git and Docker installed, you just need to run:
```bash
git clone https://github.com/TiewKH/mysql-docker-dummy
cd ./mysql-docker-dummy
docker-compose up
```

If the dummy data does not suffice, you just have to add new SQL scripts into the sql_scripts directory and when you start up the container with Docker Compose, the MySQL database will be populated with your data.
