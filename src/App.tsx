import { useState, useEffect, useRef } from 'react';
import { Heart, MapPin, Calendar, Clock, Gift, Volume2, VolumeX, ChevronDown, Send } from 'lucide-react';
import { RSVPForm } from './components/RSVPForm';

function App() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const weddingDate = new Date('2025-11-30T10:00:00');

  useEffect(() => {
    audioRef.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;

    const playAudio = () => {
      audioRef.current?.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    };

    setTimeout(playAudio, 1000);

    return () => {
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = weddingDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [weddingDate]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMusic = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="relative bg-gradient-to-b from-amber-50 via-rose-50 to-pink-100 min-h-screen overflow-x-hidden">
      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          >
            <Heart className="w-4 h-4 text-rose-300 fill-rose-300 opacity-30" />
          </div>
        ))}
      </div>

      {/* Music Control */}
      <button
        onClick={toggleMusic}
        className="fixed top-8 right-8 z-50 bg-white/90 backdrop-blur-md p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 group border border-rose-200"
      >
        {isPlaying ? (
          <Volume2 className="w-6 h-6 text-rose-500" />
        ) : (
          <VolumeX className="w-6 h-6 text-gray-400" />
        )}
        <span className="absolute right-full mr-3 px-3 py-1 bg-white rounded-lg shadow-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {isPlaying ? 'Tắt nhạc' : 'Bật nhạc'}
        </span>
      </button>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/265722/pexels-photo-265722.jpeg?auto=compress&cs=tinysrgb&w=1920)',
            transform: `scale(${1 + scrollY * 0.0003})`,
            filter: 'brightness(0.7)'
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white" />

        <div className="relative z-10 text-center px-4 animate-fade-in-up">
          <div className="mb-8 inline-block">
            <div className="relative">
              <Heart className="w-20 h-20 text-white fill-white animate-pulse-slow" />
              <div className="absolute inset-0 animate-ping-slow">
                <Heart className="w-20 h-20 text-white fill-white opacity-20" />
              </div>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl text-white/90 font-light mb-4 tracking-widest uppercase">
            We're Getting Married
          </h2>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 leading-tight">
            Hoàng Huy <span className="text-rose-300">&</span> Hồng Thủy
          </h1>

          <div className="flex items-center justify-center gap-4 text-white/90 text-lg md:text-xl mb-12">
            <Calendar className="w-5 h-5" />
            <span>30.11.2025</span>
            <span className="text-rose-300">•</span>
            <Clock className="w-5 h-5" />
            <span>10:00 AM</span>
          </div>

          <div className="inline-block px-8 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/30">
            <p className="text-white font-light tracking-wide">Trân trọng kính mời</p>
          </div>

          <div className="mt-16 animate-bounce">
            <ChevronDown className="w-8 h-8 text-white/70 mx-auto" />
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-gray-800 mb-4">Câu Chuyện Của Chúng Mình</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="group relative overflow-hidden rounded-3xl shadow-2xl aspect-[4/5] animate-fade-in-left">
              <img
                src="https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Couple 1"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div className="group relative overflow-hidden rounded-3xl shadow-2xl aspect-[4/5] animate-fade-in-right">
              <img
                src="https://images.pexels.com/photos/1445696/pexels-photo-1445696.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Couple 2"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50">
            <p className="text-lg md:text-xl text-gray-700 text-center leading-relaxed italic">
              "Tình yêu không làm cho thế giới quay tròn. Tình yêu là những gì làm cho chuyến đi đáng giá.
              Và hôm nay, chúng mình bắt đầu hành trình mới cùng nhau, với tất cả tình yêu thương và lời hứa
              sẽ luôn bên nhau trọn đời."
            </p>
          </div>
        </div>
      </section>

      {/* Countdown */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-transparent via-rose-100/50 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-gray-800 mb-4">Đếm Ngược Hạnh Phúc</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
            {[
              { label: 'Ngày', value: timeLeft.days },
              { label: 'Giờ', value: timeLeft.hours },
              { label: 'Phút', value: timeLeft.minutes },
              { label: 'Giây', value: timeLeft.seconds }
            ].map((item, index) => (
              <div
                key={index}
                className="relative group animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-pink-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
                <div className="relative bg-white rounded-3xl p-8 md:p-10 shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                  <div className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-rose-500 to-pink-600 bg-clip-text text-transparent mb-2">
                    {item.value.toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm md:text-base text-gray-600 uppercase tracking-widest font-medium">
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-gray-800 mb-4">Thông Tin Lễ Cưới</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="group bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 border border-white/50 hover:scale-105">
              <div className="flex items-start gap-6">
                <div className="bg-gradient-to-br from-rose-400 to-pink-500 p-5 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">Thời Gian</h3>
                  <div className="space-y-2 text-gray-700">
                    <p className="text-lg"><strong>Ngày:</strong> Chủ Nhật, 30 tháng 11, 2025</p>
                    <p className="text-lg"><strong>Giờ:</strong> 10:00 Sáng</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="group bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 border border-white/50 hover:scale-105">
              <div className="flex items-start gap-6">
                <div className="bg-gradient-to-br from-rose-400 to-pink-500 p-5 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">Địa Điểm</h3>
                  <div className="space-y-2 text-gray-700">
                    <p className="text-lg font-medium">Nhà Hàng Tiệc Cưới TTC Palace - Vĩnh Long (Bến Tre)</p>
                    <p className="text-base">Bên cạnh bờ hồ Trúc Giang, số 16 Hai Bà Trưng, Phường An Hội , Tỉnh Vĩnh Long</p>
                    <a
                      href="https://maps.app.goo.gl/iiUyNZPxXga5Ecv1A"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 text-rose-600 hover:text-rose-700 font-medium transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                      Xem trên bản đồ
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RSVP Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-gradient-to-br from-rose-400 to-pink-500 p-6 rounded-3xl shadow-2xl mb-6 animate-bounce-slow">
              <Send className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-800 mb-4">Xác Nhận Tham Dự</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mb-6" />
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Để chúng mình chuẩn bị chu đáo hơn, vui lòng xác nhận sự hiện diện của bạn
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50">
            <RSVPForm />
          </div>
        </div>
      </section>

      {/* Gift Section - Subtle Design */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-transparent via-amber-50/30 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-xl border border-white/50">
            <div className="text-center mb-8">
              <Gift className="w-10 h-10 text-rose-400 mx-auto mb-4 opacity-70" />
              <h3 className="text-2xl md:text-3xl font-serif text-gray-700 mb-3">Gửi Lời Chúc</h3>
              <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
                Nếu bạn không thể đến tham dự nhưng vẫn muốn gửi lời chúc mừng,
                chúng mình xin trân trọng cảm ơn tấm lòng của bạn.
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 pt-6 border-t border-gray-200">
              <div className="text-center md:text-left space-y-3">
                <div className="flex items-center justify-center md:justify-start gap-3 text-gray-700">
                  <span className="text-sm font-medium text-gray-500">Ngân hàng:</span>
                  <span className="font-semibold">BIDV</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3 text-gray-700">
                  <span className="text-sm font-medium text-gray-500">STK:</span>
                  <span className="font-semibold">7210791318</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3 text-gray-700">
                  <span className="text-sm font-medium text-gray-500">Chủ TK:</span>
                  <span className="font-semibold">HUYNH HOANG HUY</span>
                </div>
              </div>

              <div className="flex-shrink-0">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl shadow-md">
                  <div className="w-40 h-40 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                    <img
                      src="/assets/qr-bidv.jpg"
                      alt="QR chuyển khoản BIDV"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <p className="text-2xl md:text-3xl font-serif text-gray-700 mb-6 italic">
              Cảm ơn bạn đã là một phần trong ngày đặc biệt của chúng&nbsp;mình
            </p>
            <div className="flex justify-center gap-3 mb-8">
              {[...Array(5)].map((_, i) => (
                <Heart
                  key={i}
                  className="w-6 h-6 text-rose-400 fill-rose-400 animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>

          <div className="text-gray-500 text-sm">
            <p>With love, Hoàng Huy & Hồng Thủy</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
