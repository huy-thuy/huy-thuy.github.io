import { useState, useEffect, useRef } from 'react';
import { Heart, MapPin, Home, Calendar, Clock, Gift, Volume2, VolumeX, ChevronDown, Send } from 'lucide-react';
import { RSVPForm } from './components/RSVPForm';

// Fit text to single line: shrink font until fits container (force one line)
function useFitTextSingleLine(ref: React.RefObject<HTMLElement>, deps: any[] = [], minFont = 6) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      if (!el) return;
      // reset inline size to allow recompute
      el.style.fontSize = '';
      // get computed starting font size
      let font = parseFloat(window.getComputedStyle(el).fontSize || '16');
      // reduce until fits horizontally or reach minFont
      // always enforce single-line behaviour here
      while (el.scrollWidth > el.clientWidth && font > minFont) {
        font = Math.max(minFont, font - 1);
        el.style.fontSize = `${font}px`;
      }
    };
    update();
    const ro = new (window as any).ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      try { ro.disconnect(); } catch { /* ignore */ }
      window.removeEventListener('resize', update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

const FitSingleLine: React.FC<React.PropsWithChildren<{ className?: string; style?: React.CSSProperties }>> = ({ children, className = '', style }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useFitTextSingleLine(ref, [children], 6);
  // FORCE single-line on all sizes
  return (
    <div
      ref={ref}
      className={`${className} whitespace-nowrap`}
      style={{ overflow: 'hidden', textOverflow: 'ellipsis', ...style }}
    >
      {children}
    </div>
  );
};

// ----------------- ADD: sync-fit hook (ensure same font-size across paired lines) -----------------
function useSyncFitPairs(
  pairs: Array<[React.RefObject<HTMLElement>, React.RefObject<HTMLElement>]>,
  minFont = 6
) {
  useEffect(() => {
    if (!pairs || !pairs.length) return;
    const update = () => {
      pairs.forEach(([aRef, bRef]) => {
        const a = aRef.current;
        const b = bRef.current;
        if (!a || !b) return;
        // reset sizes
        a.style.fontSize = '';
        b.style.fontSize = '';
        const fontA = parseFloat(getComputedStyle(a).fontSize || '16');
        const fontB = parseFloat(getComputedStyle(b).fontSize || '16');
        let font = Math.min(fontA, fontB);

        // immediately apply the minimum so both start equal
        a.style.fontSize = `${font}px`;
        b.style.fontSize = `${font}px`;

        // reduce until both fit
        while ((a.scrollWidth > a.clientWidth || b.scrollWidth > b.clientWidth) && font > minFont) {
          font = Math.max(minFont, font - 1);
          a.style.fontSize = `${font}px`;
          b.style.fontSize = `${font}px`;
        }
      });
    };

    update();
    const ro = new (window as any).ResizeObserver(update);
    pairs.forEach(([aRef, bRef]) => {
      if (aRef.current) ro.observe(aRef.current);
      if (bRef.current) ro.observe(bRef.current);
    });
    window.addEventListener('resize', update);
    return () => {
      try { ro.disconnect(); } catch {}
      window.removeEventListener('resize', update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairs.length]);
}

function App() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [showRSVP, setShowRSVP] = useState(false);
  const [showWish, setShowWish] = useState(false);
  const [showAllAlbum, setShowAllAlbum] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // refs for syncing font-size across left/right rows
  const leftRow1 = useRef<HTMLDivElement | null>(null);
  const leftRow2 = useRef<HTMLDivElement | null>(null);
  const leftRow3 = useRef<HTMLDivElement | null>(null);
  const rightRow1 = useRef<HTMLDivElement | null>(null);
  const rightRow2 = useRef<HTMLDivElement | null>(null);
  const rightRow3 = useRef<HTMLDivElement | null>(null);

  // ensure paired lines use same font-size
  useSyncFitPairs(
    [
      [leftRow1, rightRow1],
      [leftRow2, rightRow2],
      [leftRow3, rightRow3]
    ],
    8
  );

  const weddingDate = new Date('2025-11-30T10:00:00');
  const flowers = useRef(
    Array.from({ length: 12 }, () => ({
      left: Math.random() * 100,
      animationDelay: Math.random() * 8,
      animationDuration: 18 + Math.random() * 12,
      swayDuration: 3 + Math.random() * 2,
      size: 20 + Math.random() * 15,
      colorIndex: Math.floor(Math.random() * 4)
    }))
  ).current;

  // Album image filenames (place the actual files into public/assets/album/)
  const albumFiles = [
    'IMGL0001.jpg',
    'IMGL0163.jpg',
    'IMGL1707.jpg',
    'IMGL0355.jpg',
    'IMGL0368.jpg',
    'IMGL0434.jpg',
    'IMGL1399.jpg',
    'IMGL0944.jpg',
    'hinh_2.JPG',
    'IMGL1720.jpg',
    'IMGL2897.jpg',
    'hinh_3.JPG',
    'IMGL9201.jpg',
    'IMGL9781.jpg',
    'IMGL9869.jpg',
    'IMGL9901.jpg',
    'IMGL9450.jpg'
    // IMGL9168.jpg removed from grid because it's used as the full-width banner below
  ];

  useEffect(() => {
    // create audio element (muted at start so browsers allow autoplay)
    audioRef.current = new Audio('/assets/mylove.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;
    audioRef.current.muted = true;

    const tryAutoplay = async () => {
      try {
        await audioRef.current?.play();
        // playing (muted)
        setIsPlaying(true);
      } catch {
        // autoplay with sound blocked — we'll wait for a user gesture
      }
    };
    tryAutoplay();

    // On first user gesture, unmute and ensure playback with sound
    const onFirstGesture = () => {
      if (!audioRef.current) return;
      audioRef.current.muted = false;
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
      window.removeEventListener('click', onFirstGesture);
      window.removeEventListener('touchstart', onFirstGesture);
    };
    window.addEventListener('click', onFirstGesture, { once: true });
    window.addEventListener('touchstart', onFirstGesture, { once: true });

    // pause when tab hidden, resume when visible
    const handleVisibility = () => {
      if (document.hidden) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      audioRef.current?.pause();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('click', onFirstGesture);
      window.removeEventListener('touchstart', onFirstGesture);
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

  // Observe album images and add slide-in classes when they enter viewport
  useEffect(() => {
     const els = Array.from(document.querySelectorAll<HTMLElement>('[data-anim]'));
     if (!els.length) return;
 
     const obs = new IntersectionObserver(
       (entries) => {
         entries.forEach((entry) => {
           if (!entry.isIntersecting) return;
           const el = entry.target as HTMLElement;
           const dir = el.dataset.anim === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left';
           const delay = el.dataset.delay ?? '0s';
           el.style.animationDelay = delay;
           el.classList.add(dir);
           el.classList.remove('opacity-0');
           obs.unobserve(el);
         });
       },
       { threshold: 0.15 }
     );
 
     els.forEach((el) => {
       // start hidden
       el.classList.add('opacity-0');
       obs.observe(el);
     });
 
     return () => obs.disconnect();
  }, [showAllAlbum]); // re-run when user reveals rest of album so new elements get observed

  const toggleMusic = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    // user-initiated: ensure we have an audio element, unmute and play
    if (!audioRef.current) {
      audioRef.current = new Audio('/assets/mylove.mp3');
      audioRef.current.loop = true;
    }
    audioRef.current.muted = false;
    audioRef.current.volume = 0.4;
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };

  return (
    <div className="relative bg-gradient-to-b from-amber-50 via-rose-50 to-pink-100 min-h-screen overflow-x-hidden">
            {/* Falling Flowers */}

      <div className="fixed inset-0 overflow-visible pointer-events-none z-10">

        {flowers.map((flower, i) => {

          const colors = [

            { petals: '#FFB6C1', center: '#FF69B4' },

            { petals: '#FFC0CB', center: '#FF1493' },

            { petals: '#FFDAB9', center: '#FFA500' },

            { petals: '#FFE4E1', center: '#FFC0CB' }

          ];

          const color = colors[flower.colorIndex];



          return (

            <div

              key={i}

              className="absolute animate-fall-continuous"

              style={{

                left: `${flower.left}%`,

                animationDelay: `${flower.animationDelay}s`,

                animationDuration: `${flower.animationDuration}s`

              }}

            >

              <svg

                width={flower.size}

                height={flower.size}

                viewBox="0 0 50 50"

                className="animate-sway"

                style={{

                  animationDuration: `${flower.swayDuration}s`,

                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'

                }}

              >

                <g transform="translate(25, 25)">

                  <ellipse cx="0" cy="-12" rx="8" ry="12" fill={color.petals} opacity="0.9" transform="rotate(0)" />

                  <ellipse cx="0" cy="-12" rx="8" ry="12" fill={color.petals} opacity="0.9" transform="rotate(72)" />

                  <ellipse cx="0" cy="-12" rx="8" ry="12" fill={color.petals} opacity="0.9" transform="rotate(144)" />

                  <ellipse cx="0" cy="-12" rx="8" ry="12" fill={color.petals} opacity="0.9" transform="rotate(216)" />

                  <ellipse cx="0" cy="-12" rx="8" ry="12" fill={color.petals} opacity="0.9" transform="rotate(288)" />

                  <circle cx="0" cy="0" r="5" fill={color.center} opacity="0.95" />

                  <circle cx="0" cy="0" r="3" fill="#FFF9E3" opacity="0.7" />

                </g>

              </svg>

            </div>

          );

        })}
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
            backgroundImage: "url('/assets/hinh_1.JPG')",
            backgroundSize: 'cover',               // make image cover the area responsively
            backgroundPosition: 'center 20%',      // shift image upward (adjust % to taste)
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
            Thư mời cưới
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
            <h2 className="text-3xl md:text-4xl font-serif text-gray-800 mb-4">Câu Chuyện Của Chúng&nbsp;Mình</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="group relative overflow-hidden rounded-3xl shadow-2xl aspect-[4/5] animate-fade-in-left">
              <img
                src="/assets/hinh_2.JPG"
                alt="Couple 1"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div className="group relative overflow-hidden rounded-3xl shadow-2xl aspect-[4/5] animate-fade-in-right">
              <img
                src="/assets/hinh_3.JPG"
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
            <h2 className="text-3xl md:text-4xl font-serif text-gray-800 mb-4">Đếm Ngược Hạnh&nbsp;Phúc</h2>
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
            <div className="flex flex-col items-stretch justify-center gap-6 mb-8">
              {/* PARENTS: horizontal row (Nhà trai / Nhà gái) */}
              <div className="flex flex-row items-stretch justify-center gap-4 mb-8 w-full max-w-6xl mx-auto px-2">
                <div className="flex-1 min-w-0 px-1">
                  <div className="p-4 md:p-6 rounded-3xl text-center">
                    <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-2">Nhà trai</h4>

                    <div className="space-y-1">
                      <div
                        ref={leftRow1}
                        className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-nowrap overflow-hidden"
                        aria-label="Nhà trai - dòng 1"
                      >
                        <span className="font-medium">Ông</span> Huỳnh Hữu Hoàng
                      </div>
                      <div
                        ref={leftRow2}
                        className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-nowrap overflow-hidden"
                        aria-label="Nhà trai - dòng 2"
                      >
                        <span className="font-medium">Bà</span> Phạm Thị Thanh Hiếu
                      </div>
                      <div
                        ref={leftRow3}
                        className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-nowrap overflow-hidden"
                        aria-label="Nhà trai - dòng 3"
                      >
                        Châu Thành, tỉnh Bến Tre
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0 px-1">
                  <div className="p-4 md:p-6 rounded-3xl text-center">
                    <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-2">Nhà gái</h4>

                    <div className="space-y-1">
                      <div
                        ref={rightRow1}
                        className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-nowrap overflow-hidden"
                        aria-label="Nhà gái - dòng 1"
                      >
                        <span className="font-medium">Ông</span> Phan Vủ Thành
                      </div>
                      <div
                        ref={rightRow2}
                        className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-nowrap overflow-hidden"
                        aria-label="Nhà gái - dòng 2"
                      >
                        <span className="font-medium">Bà</span> Nguyễn Thị Hồng Thu
                      </div>
                      <div
                        ref={rightRow3}
                        className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-nowrap overflow-hidden"
                        aria-label="Nhà gái - dòng 3"
                      >
                        Mỏ Cày Nam, tỉnh Bến Tre
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* NAMES: separate horizontal row (Chú rể / Cô dâu) */}
              <div className="flex flex-row items-center justify-center gap-4 mb-8 w-full max-w-6xl mx-auto px-2 relative">
                <div className="flex-1 min-w-0 px-1">
                  <div className="p-4 md:p-6 text-center">
                    <h5 className="text-sm md:text-base font-semibold text-gray-700 mb-2">Chú rể</h5>
                    <FitSingleLine className="text-xl md:text-2xl font-script text-gray-800">
                      Hoàng Huy
                    </FitSingleLine>
                  </div>
                </div>

                {/* Artistic heart between names */}
                <div className="flex-shrink-0 flex items-center justify-center mx-2 z-20">
                  <div className="w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center bg-white/95 shadow-lg transform transition-all duration-300 hover:scale-105">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-8 h-8 md:w-10 md:h-10" role="img" aria-label="Trái tim nghệ thuật">
                      <defs>
                        <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
                          <stop offset="0" stopColor="#ff9ab3"/>
                          <stop offset="1" stopColor="#ff5a78"/>
                        </linearGradient>
                        <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#ff8aa3" floodOpacity="0.25"/>
                        </filter>
                      </defs>

                      {/* filled heart with subtle hand-drawn outline */}
                      <g filter="url(#sh)">
                        <path
                          d="M32 52s-20-11-24-16c-6-7 2-18 12-14 4 2 7 6 10 6s6-4 10-6c10-4 18 7 12 14-4 5-20 16-20 16z"
                          fill="url(#g1)"
                          opacity="0.98"
                        />
                      </g>

                      <path
                        d="M32 50s-18-11-22-16c-6-7 1-17 11-13 4 2 7 6 11 6s7-4 11-6c10-4 17 6 11 13-4 5-22 16-22 16z"
                        fill="none"
                        stroke="#fff6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* small sparkles */}
                      <g fill="#fff8" opacity="0.9">
                        <circle cx="20" cy="18" r="1.2"/>
                        <circle cx="44" cy="16" r="1.6"/>
                        <circle cx="34" cy="10" r="1"/>
                      </g>

                      {/* gentle pulse animation */}
                      <style>{`
                        @keyframes subtle-pulse {
                          0% { transform: scale(1); opacity: 1; }
                          50% { transform: scale(1.08); opacity: 0.95; }
                          100% { transform: scale(1); opacity: 1; }
                        }
                        svg { animation: subtle-pulse 3.5s ease-in-out infinite; transform-origin: center; }
                      `}</style>
                    </svg>
                  </div>
                </div>

                <div className="flex-1 min-w-0 px-1">
                  <div className="p-4 md:p-6 text-center">
                    <h5 className="text-sm md:text-base font-semibold text-gray-700 mb-2">Cô dâu</h5>
                    <FitSingleLine className="text-xl md:text-2xl font-script text-gray-800">
                      Hồng Thủy
                    </FitSingleLine>
                  </div>
                </div>
              </div>
            </div>

            {/* TWO ADJACENT PHOTOS — no horizontal scroll, images shrink-to-fit and keep aspect */}
            <div className="flex flex-row items-stretch gap-4 mb-8 w-full max-w-7xl mx-auto px-2">
              <div className="flex-1 min-w-0">
                <div className="group relative overflow-hidden rounded-3xl shadow-2xl aspect-[4/5]">
                  <img
                    src="/assets/chure.JPG"
                    alt="Hoàng Huy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="group relative overflow-hidden rounded-3xl shadow-2xl aspect-[4/5]">
                  <img
                    src="/assets/codau.JPG"
                    alt="Hồng Thủy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-serif text-gray-800 mb-4">Thông Tin Lễ Cưới</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="group bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 border border-white/50 hover:scale-105">
              <div className="flex items-start gap-6">
                <div className="bg-gradient-to-br  p-5 rounded-2xl shadow-lg bg-white flex items-center justify-center group-hover:scale-110 transition-transform border border-gray-100">
                  <Home className="w-12 h-12 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">Tiệc Nhà Trai</h3>
                  <div className="space-y-2 text-gray-700">
                    <p className="text-lg leading-relaxed">Chủ Nhật, 30 tháng 11, 2025</p>
                    <p className="text-lg leading-relaxed">10:00 sáng</p>

                    <p className="text-lg font-medium mt-3">Địa điểm: Nhà Hàng TTC Palace - Bến Tre</p>
                    <p className="text-lg leading-relaxed">Số 16 Hai Bà Trưng, Phường An Hội, Tỉnh Bến&nbsp;Tre</p>

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

            <div className="group bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 border border-white/50 hover:scale-105">
              <div className="flex items-start gap-6">
                <div className="bg-gradient-to-br p-5 rounded-2xl shadow-lg bg-white flex items-center justify-center group-hover:scale-110 transition-transform border border-gray-100">
                  <Home className="w-12 h-12 text-rose-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">Tiệc Nhà Gái</h3>
                  <div className="space-y-2 text-gray-700">
                    <p className="text-lg leading-relaxed">Thứ Bảy, 29 tháng 11, 2025</p>
                    <p className="text-lg leading-relaxed">02:00 chiều</p>

                    <p className="text-lg font-medium mt-3">Địa điểm: Tư gia nhà gái</p>
                    <p className="text-lg leading-relaxed">An Hòa, Phước Hiệp, Mỏ Cày Nam, Tỉnh Bến&nbsp;Tre</p>

                    <a
                      href="https://maps.app.goo.gl/GL87kLfR4XkRmUzVA"
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
            <h2 className="text-3xl md:text-4xl font-serif text-gray-800 mb-4">Xác Nhận Tham Dự</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mb-6" />
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Để chúng mình chuẩn bị chu đáo hơn, vui lòng xác nhận sự hiện diện của bạn
            </p>
          </div>

          <div className="flex justify-center">
            {!showRSVP ? (
              <button
                onClick={() => setShowRSVP(true)}
                className="inline-flex items-center gap-3 px-6 py-3 bg-rose-500 text-white rounded-3xl shadow-lg hover:scale-105 transition transform"
              >
                <Send className="w-5 h-5" />
                Xác nhận tham dự
              </button>
            ) : (
              <div className="w-full bg-white/70 backdrop-blur-lg rounded-3xl p-6 md:p-8 shadow-2xl border border-white/50 transform transition-all duration-300">
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setShowRSVP(false)}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Đóng form"
                  >
                    Đóng ✕
                  </button>
                </div>
                <RSVPForm />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Gift Section - toggled by button */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-transparent via-amber-50/30 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-xl border border-white/50">
            <div className="text-center mb-8">
              <Gift className="w-10 h-10 text-rose-400 mx-auto mb-4 opacity-70" />
              <h3 className="text-2xl md:text-3xl font-serif text-gray-700 mb-3">Gửi Mừng Cưới</h3>
              {/* <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
                Nếu bạn không thể đến tham dự nhưng vẫn muốn chúc mừng,
                chúng mình xin trân trọng cảm ơn tấm lòng của bạn.
              </p> */}
            </div>

            <div className="pt-6 border-t border-gray-200">
              <div className="flex justify-center mb-6">
                {!showWish ? (
                  <button
                    onClick={() => setShowWish(true)}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-rose-500 text-white rounded-3xl shadow-lg hover:scale-105 transition transform"
                  >
                    <Gift className="w-5 h-5" />
                    Xem thông tin gửi mừng cưới
                  </button>
                ) : (
                  <div className="w-full">
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={() => setShowWish(false)}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Đóng thông tin gửi lời chúc"
                      >
                        Đóng ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Cô dâu */}
                      <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center">
                        <h4 className="font-semibold text-lg mb-3">Cô dâu</h4>
                        <div className="text-center md:text-left space-y-3 w-full max-w-xs">
                          <div className="flex items-center justify-center md:justify-start gap-3 text-gray-700">
                            <span className="text-sm font-medium text-gray-500">Ngân hàng:</span>
                            <span className="font-semibold">Vietcombank</span>
                          </div>
                          <div className="flex items-center justify-center md:justify-start gap-3 text-gray-700">
                            <span className="text-sm font-medium text-gray-500">STK:</span>
                            <span className="font-semibold">0171003478512</span>
                          </div>
                          <div className="flex items-center justify-center md:justify-start gap-3 text-gray-700">
                            <span className="text-sm font-medium text-gray-500">Chủ TK:</span>
                            <span className="font-semibold">PHAN THI HONG THUY</span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="w-40 h-40 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                            <img
                              src="/assets/qr-vietcombank.jpg"
                              alt="QR Cô dâu"
                              className="w-full h-full object-contain rounded-lg"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <a
                            href="/assets/qr-vietcombank.jpg"
                            download
                            className="px-5 py-2 bg-rose-500 text-white rounded-full shadow hover:opacity-90 transition"
                          >
                            Tải QR Cô dâu
                          </a>
                        </div>
                      </div>

                      {/* Chú rể */}
                      <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center">
                        <h4 className="font-semibold text-lg mb-3">Chú rể</h4>
                        <div className="text-center md:text-left space-y-3 w-full max-w-xs">
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

                        <div className="mt-4">
                          <div className="w-40 h-40 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                            <img
                              src="/assets/qr-bidv.jpg"
                              alt="QR Chú rể"
                              className="w-full h-full object-contain rounded-lg"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <a
                            href="/assets/qr-bidv.jpg"
                            download
                            className="px-5 py-2 bg-blue-500 text-white rounded-full shadow hover:opacity-90 transition"
                          >
                            Tải QR Chú rể
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ALBUM HÌNH CƯỚI */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif text-gray-800 mb-4">Album Hình Cưới</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full" />
          </div>

          {/* Top visible layout: use topReplacements for the 4 visible slots only */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {(() => {
              const topReplacements = ['new_1.jpg','new_2.jpg','new_3.jpg','new_4.jpg'];
              return (
                <>
                  <div className="lg:col-span-1">
                    <div
                      className="overflow-hidden rounded-3xl shadow-2xl relative group"
                      data-anim="left"
                      data-delay="0.05s"
                    >
                      <div className="w-full h-[60vh] lg:h-[80vh]">
                        <img
                          src={`/assets/album/${topReplacements[0]}`}
                          alt={topReplacements[0]}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 rounded-3xl"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2 flex flex-col gap-6">
                    <div
                      className="overflow-hidden rounded-3xl shadow-2xl relative group"
                      data-anim="right"
                      data-delay="0.12s"
                    >
                      <div className="w-full aspect-[16/9]">
                        <img
                          src={`/assets/album/${topReplacements[1]}`}
                          alt={topReplacements[1]}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 rounded-3xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div
                        className="overflow-hidden rounded-3xl shadow-2xl relative group"
                        data-anim="right"
                        data-delay="0.20s"
                      >
                        <div className="w-full aspect-[4/3]">
                          <img
                            src={`/assets/album/${topReplacements[2]}`}
                            alt={topReplacements[2]}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 rounded-3xl"
                          />
                        </div>
                      </div>

                      <div
                        className="overflow-hidden rounded-3xl shadow-2xl relative group"
                        data-anim="right"
                        data-delay="0.28s"
                      >
                        <div className="w-full aspect-[4/3]">
                          <img
                            src={`/assets/album/${topReplacements[3]}`}
                            alt={topReplacements[3]}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 rounded-3xl"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Additional rows: featured block + remaining images */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
            {(() => {
              const featured = ['IMGL9901.jpg','IMGL9201.jpg','IMGL9869.jpg','IMGL9781.jpg','IMGL9450.jpg'];
              const remaining = albumFiles.filter(f => !featured.includes(f));
              const baseDelay = 0.35;
              const nodes: JSX.Element[] = [];

              // LEFT large (spans 2 cols x 2 rows on lg)
              nodes.push(
                <div
                  key={featured[0]}
                  className="overflow-hidden rounded-3xl shadow-2xl relative group lg:col-span-2 lg:row-span-2"
                  data-anim="left"
                  data-delay={`${baseDelay.toFixed(2)}s`}
                  style={{ animationDelay: `${baseDelay.toFixed(2)}s` }}
                >
                  <img
                    src={`/assets/album/${featured[0]}`}
                    alt={featured[0]}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 rounded-3xl"
                  />
                </div>
              );

              // RIGHT four portrait tiles
              featured.slice(1).forEach((file, i) => {
                const delay = (baseDelay + 0.08 * (i + 1)).toFixed(2) + 's';
                const animSide = (i + 1) % 2 === 0 ? 'left' : 'right';
                nodes.push(
                  <div
                    key={file}
                    className={`overflow-hidden rounded-3xl shadow-2xl relative group`}
                    data-anim={animSide}
                    data-delay={delay}
                    style={{ animationDelay: delay }}
                  >
                    <div className="w-full h-full">
                      <img
                        src={`/assets/album/${file}`}
                        alt={file}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 rounded-3xl"
                      />
                    </div>
                  </div>
                );
              });

              // remaining images (rendered after featured block)
              remaining.forEach((file, j) => {
                const idx = featured.length + j;
                const delay = (baseDelay + 0.08 * idx).toFixed(2) + 's';
                const animSide = idx % 2 === 0 ? 'left' : 'right';
                nodes.push(
                  <div
                    key={file}
                    className={`overflow-hidden rounded-3xl shadow-2xl relative group`}
                    data-anim={animSide}
                    data-delay={delay}
                    style={{ animationDelay: delay }}
                  >
                    <div className="w-full h-full">
                      <img
                        src={`/assets/album/${file}`}
                        alt={file}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 rounded-3xl"
                      />
                    </div>
                  </div>
                );
              });

              if (!showAllAlbum) {
                const preview = nodes.slice(0, 4);
                const remainingCount = nodes.length - preview.length;
                return (
                  <>
                    {preview}
                    <div className="lg:col-span-4 flex items-center justify-center">
                      <button
                        onClick={() => setShowAllAlbum(true)}
                        className="px-6 py-4 bg-rose-500 text-white rounded-3xl shadow-lg hover:scale-105 transition transform"
                      >
                        Xem thêm ảnh
                      </button>
                    </div>
                  </>
                );
              }

              return nodes;
            })()}
          </div>

          {/* Banner hình ngang cuối album */}
          <div className="mt-8">
            <div className="overflow-hidden rounded-3xl shadow-2xl">
              <img
                src="/assets/album/IMGL9168.jpg"
                alt="IMGL9168"
                className="w-full h-[36vh] md:h-[48vh] lg:h-[56vh] object-cover rounded-3xl"
              />
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
            <p>Made by chồng iu của Thỷ</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
