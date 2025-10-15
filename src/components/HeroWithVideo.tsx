import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface HeroWithVideoProps {
  videoUrl?: string;
  posterImage?: string;
}

const HeroWithVideo = ({ 
  videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  posterImage = "/api/placeholder/800/450"
}: HeroWithVideoProps) => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleReportClick = () => {
    navigate('/report');
  };

  const handleProtectClick = () => {
    navigate('/auth?action=protect');
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const time = parseFloat(e.target.value);
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const resetVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden bg-background">
      <div className="container relative z-10 py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6">
        {/* Grid Layout - Mobile: Stack, Tablet/Desktop: Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Hero Content */}
          <div className="space-y-4 sm:space-y-5 lg:space-y-4 animate-fade-in order-2 lg:order-1">
            <div className="inline-block px-3 py-1.5 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full">
              <span className="text-xs font-medium text-primary">
                🛡️ Protection garantie par cryptage AES-256
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
                Protégez vos projets,
              </span>
              <br />
              <span className="text-foreground">
                Combattez la corruption
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-base text-muted-foreground leading-relaxed">
              Plateforme citoyenne sécurisée pour taper le Ndjobi de manière <strong className="text-foreground">100% anonyme</strong> et protéger vos innovations avec un <strong className="text-foreground">horodatage infalsifiable</strong>.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                size="lg" 
                onClick={handleReportClick}
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                aria-label="Taper le Ndjobi"
              >
                🚨 Taper le Ndjobi
              </Button>
              <Button 
                size="lg" 
                onClick={handleProtectClick}
                variant="secondary" 
                className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                aria-label="Protéger mon projet"
              >
                🔒 Protéger mon projet
              </Button>
            </div>
          </div>

          {/* Right Column - Video Player */}
          <div className="animate-fade-in order-1 lg:order-2">
            <Card className="overflow-hidden shadow-2xl border-2 border-border/50">
              <CardContent className="p-0">
                <div className="relative group">
                  {/* Vidéo */}
                  <video
                    ref={videoRef}
                    className="w-full h-auto aspect-video object-cover"
                    poster={posterImage}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    muted={isMuted}
                    preload="metadata"
                  >
                    <source src={videoUrl} type="video/mp4" />
                    Votre navigateur ne supporte pas la lecture de vidéos.
                  </video>

                  {/* Overlay de contrôle */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {/* Bouton play/pause central */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button
                        size="lg"
                        className="rounded-full w-16 h-16 bg-primary/90 hover:bg-primary text-white shadow-lg"
                        onClick={togglePlay}
                      >
                        {isPlaying ? (
                          <Pause className="h-8 w-8" />
                        ) : (
                          <Play className="h-8 w-8 ml-1" />
                        )}
                      </Button>
                    </div>

                    {/* Contrôles en bas */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      {/* Barre de progression */}
                      <div className="mb-3">
                        <input
                          type="range"
                          min="0"
                          max={duration || 0}
                          value={currentTime}
                          onChange={handleSeek}
                          className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                          style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) 100%)`
                          }}
                        />
                      </div>

                      {/* Contrôles */}
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20 h-8 w-8 p-0"
                            onClick={togglePlay}
                          >
                            {isPlaying ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20 h-8 w-8 p-0"
                            onClick={toggleMute}
                          >
                            {isMuted ? (
                              <VolumeX className="h-4 w-4" />
                            ) : (
                              <Volume2 className="h-4 w-4" />
                            )}
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20 h-8 w-8 p-0"
                            onClick={resetVideo}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>

                          <span className="text-sm font-mono hidden sm:inline">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </span>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20 h-8 w-8 p-0"
                          onClick={toggleFullscreen}
                        >
                          <Maximize className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Info sous la vidéo */}
            <div className="mt-4 text-center lg:text-left">
              <p className="text-sm text-muted-foreground">
                Découvrez NDJOBI en vidéo
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 md:h-20 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default HeroWithVideo;

