#include <iostream>
#include <fstream>
#include <boost/asio.hpp>
#include <opencv2/opencv.hpp>

using namespace boost::asio;

cv::Mat pixelate_image(cv::Mat &mat);
cv::Mat pixelate_image(cv::Mat mat, cv::Size resolution);

int main() {
    io_service ioService;
    ip::tcp::acceptor acceptor(ioService, ip::tcp::endpoint(ip::tcp::v4(), 6000));
    
    while (true) {
        ip::tcp::socket socket(ioService);
        acceptor.accept(socket);
        
        // Receive image data
        std::vector<char> imageData;
        boost::system::error_code error;

        do {
            char buf[1024];
            size_t bytesReceived = socket.read_some(buffer(buf), error);

            if (error == boost::asio::error::eof) {
                break; // Connection closed by client
            } else if (error) {
                std::cerr << "Error receiving data: " << error.message() << std::endl;
                break;
            }

            imageData.insert(imageData.end(), buf, buf + bytesReceived);
      } while (true);
std::cout << "IMAAGE received" << std::endl;
        
        // Process the received image (you can save it to a file, analyze, etc.)
		

		cv::Mat to_pixelate = cv::imdecode(imageData, 1);

		cv::Mat abstract_pixel = pixelate_image(to_pixelate);
	
std::cout << "IMAGE pixelated" << std::endl;


		std::vector<uchar>encoded;
		cv::imencode(".png", abstract_pixel, encoded);

		char buf[encoded.size()];

		size_t i = 0;
		for (std::vector<uchar>::iterator it = encoded.begin(); it != encoded.end(); it++)
		{
			buf[i] = *it;
			i++;
		}



        boost::asio::write(socket, boost::asio::buffer(buf, encoded.size()));
std::cout << "IMAGE sent back" << std::endl;

        // Continue with the next client connection
    }
    
    return 0;
}

