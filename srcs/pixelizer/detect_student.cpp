#include <opencv2/opencv.hpp>
#include <iostream>

cv::Mat refine_with_grabCut(cv::Mat image);
cv::Mat pixelate_image(cv::Mat input, cv::Size resolution);
cv::Mat reduce_palette(cv::Mat input);

cv::Mat pixelate_image(cv::Mat &image)
{
	cv::CascadeClassifier faceCascade;
    std::string faceCascadeFile = "/project/cascade/haarcascade_frontalface_alt.xml";

    if (!faceCascade.load(faceCascadeFile)) {
        std::cerr << "Error loading face cascade.\n";
	    throw(std::exception());
    }

    cv::Mat grayImage;
    cv::cvtColor(image, grayImage, cv::COLOR_BGR2GRAY);

    std::vector<cv::Rect> faces;
    faceCascade.detectMultiScale(grayImage, faces, 1.3, 5);

    cv::Mat pixelated;
	
    if (faces.size() > 0)
    {
      const double expand_factor = 0.5;


      faces[0].x -= faces[0].width * expand_factor;
      faces[0].width += faces[0].width * expand_factor * 2;
      faces[0].y -= faces[0].height * expand_factor;
      faces[0].height += faces[0].height * expand_factor * 2;
      
      if (faces[0].x < 0)
          faces[0].x = 0;
      if (faces[0].y < 0)
          faces[0].y = 0;

      const double w = grayImage.size().width;
      const double h = grayImage.size().height;
      if (faces[0].width + faces[0].x > w)
        faces[0].width = w - faces[0].x;
      if (faces[0].height + faces[0].y > h)
        faces[0].height = h - faces[0].y;

      cv::Mat just_face_image(image, faces[0]);

      cv::Mat grabCutted = refine_with_grabCut(just_face_image);

      pixelated = pixelate_image(grabCutted, cv::Size(32, 32));
    } else {
      pixelated = pixelate_image(image, cv::Size(32, 32));
    }
	return (pixelated);
}

cv::Mat pixelate_image(std::string path) {

    cv::Mat image = cv::imread(path);
    if (image.empty()) {
        std::cerr << "Error loading image.\n";
	    throw(std::exception());
    }
	return (pixelate_image(image));
}

cv::Mat pixelate_image(cv::Mat input, cv::Size resolution)
{
	cv::Mat pixelated_small(resolution, CV_8UC4, cv::INTER_NEAREST);
	cv::resize(input, pixelated_small, resolution);	
	pixelated_small = reduce_palette(pixelated_small);
	cv::Mat pixelated_restored(input.size(), CV_8UC4);
	cv::resize(pixelated_small, pixelated_restored, cv::Size(600, 600), 0, 0, cv::INTER_NEAREST);	
	return (pixelated_small);
}

cv::Mat refine_with_grabCut(cv::Mat image)
{
	const double all_factor  = 0.1;
	const double remove_factor = 0.2;
	
    cv::Mat mask(image.size(), CV_8UC1, cv::Scalar::all(cv::GC_BGD));
	cv::Rect r_left(0, 0, image.size().width * remove_factor, image.size().height);
	cv::Rect r_right(image.size().width - image.size().width * remove_factor, 0, image.size().width * remove_factor, image.size().height);
	cv::Rect r_center(image.size().width / 2 - image.size().width * 0.15, image.size().height / 2 - image.size().height * 0.15, image.size().width * 0.3, image.size().height * 0.3);
	cv::Rect all(image.size().width * all_factor, image.size().height * all_factor, image.size().width * (1 - all_factor * 2), image.size().height * (1 - all_factor * 2));

	cv::Mat fg_result;

    cv::grabCut(image, mask, all, cv::Mat(), fg_result, 3, cv::GC_INIT_WITH_RECT);
    mask(r_center).setTo(cv::GC_FGD);
    mask(r_left).setTo(cv::GC_BGD);
    mask(r_right).setTo(cv::GC_BGD);
    cv::grabCut(image, mask, all, cv::Mat(), fg_result, 3, cv::GC_INIT_WITH_MASK);

    // Modify the mask to keep only the foreground and probable foreground pixels

    // Create a 3-channel foreground image
    cv::Mat foregroundMask = (mask == cv::GC_FGD) | (mask == cv::GC_PR_FGD);
    cv::Mat foregroundImage(image.size(), CV_8UC3, cv::Scalar(0, 0, 0));

    // Copy the foreground pixels from the original image to the foreground image
    image.copyTo(foregroundImage, foregroundMask);

    // Display the output
//	cv::rectangle(foregroundImage, r_center, cv::Scalar(255, 0, 0));
//	cv::rectangle(foregroundImage, r_left, cv::Scalar(0, 0, 255));
//	cv::rectangle(foregroundImage, r_right, cv::Scalar(0, 0, 255));
//	cv::rectangle(foregroundImage, all, cv::Scalar(0, 255, 255));
//    cv::imshow("Person in Foreground", foregroundImage);
//    cv::waitKey(0);

	return (foregroundImage);
}

cv::Mat	reduce_palette(cv::Mat full_palette)
{
	int paletteSize = 8;

	cv::Mat	img;
	
	cv::cvtColor(full_palette, img, cv::COLOR_BGR2Lab);
	cv::Mat colVec = img.reshape(1, img.rows*img.cols);
	cv::Mat colVecD;
	colVec.convertTo(colVecD, CV_32FC3, 1.0);

	cv::Mat	labels, centers;
	cv::kmeans(colVecD, paletteSize, labels, cv::TermCriteria(cv::TermCriteria::MAX_ITER, 100, 0.1), 3, cv::KMEANS_PP_CENTERS, centers);
	cv::Mat imgPosterized = img.clone();
	for (int i = 0; i < img.rows; i++)
		for (int j = 0; j < img.cols; j++)
			for (int k = 0; k < 3; k++)
				imgPosterized.at<cv::Vec3b>(i,j)[k] = centers.at<float>(labels.at<int>(j+img.cols*i),k);

	cv::Mat imgPosterizedBGR;

	cv::cvtColor(imgPosterized, imgPosterizedBGR, cv::COLOR_Lab2BGR);

	return (imgPosterizedBGR);
}
