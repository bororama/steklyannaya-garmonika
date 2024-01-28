all:
	g++ detect_student.cpp `pkg-config --cflags --libs opencv` --std=c++11

asio:
	g++ asio.cpp detect_student.cpp `pkg-config --cflags --libs opencv` -lboost_system -lpthread -o asio.out --std=c++11

see_test:
	g++ see_test.cpp detect_student.cpp $(shell pkg-config --cflags --libs opencv --static) -I ../boost_1_83_0 -L../boost_1_83_0/libs  -lpthread -o see_test.out --std=c++11
