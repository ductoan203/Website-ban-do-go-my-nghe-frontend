import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';

const images = [
  "/images/banner1.png",
  "/images/banner3.png",
  "/images/banner2.png"
];

const BannerCarousel = () => (
  <div className="w-full max-w-6xl mx-auto mt-4 rounded-2xl overflow-hidden shadow-lg bg-white">
    <Carousel
      autoPlay
      infiniteLoop
      showThumbs={false}
      showStatus={false}
      interval={3500}
      transitionTime={800}
      emulateTouch
    >
      {images.map((src, idx) => (
        <div key={idx} className="flex items-center justify-center bg-white">
          <img
            src={src}
            alt={`Banner ${idx + 1}`}
            className="w-full h-[500px] transition-all duration-700 mx-auto"
          />
        </div>
      ))}
    </Carousel>
  </div>
);

export default BannerCarousel;
