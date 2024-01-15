FROM ubuntu:18.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y make g++ unzip libopencv-dev libboost-all-dev

COPY build_parts /build_parts

RUN ls && cat /build_parts/xaa /build_parts/xab /build_parts/xac /build_parts/xad /build_parts/xae /build_parts/xaf > build.zip && unzip build.zip && mkdir -p project

COPY detect_student.cpp asio.cpp ../Makefile project

COPY cascade /project/cascade

RUN cd project && make asio

CMD /project/asio.out
