import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Compass,
  Navigation,
  ExternalLink,
  LocateFixed,
  Search,
  CheckCircle2,
  Globe,
  Layers,
  Sparkles
} from 'lucide-react';
import { SyrianGovernorate } from '../types';
import { SYRIAN_GOVERNORATES, GOVERNORATE_COORDINATES } from '../constants/syrianData';

interface MapLocationPickerProps {
  governorate: SyrianGovernorate;
  onGovernorateChange?: (gov: SyrianGovernorate) => void;
  locationDetails: string;
  onLocationDetailsChange: (details: string) => void;
  latitude: number;
  longitude: number;
  onCoordinatesChange: (lat: number, lng: number) => void;
  title?: string;
  accentColor?: 'teal' | 'purple' | 'amber' | 'pink' | 'emerald';
}

export default function MapLocationPicker({
  governorate,
  onGovernorateChange,
  locationDetails,
  onLocationDetailsChange,
  latitude,
  longitude,
  onCoordinatesChange,
  title = 'تحديد الموقع على خريطة Google',
  accentColor = 'teal'
}: MapLocationPickerProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [googleMapsUrlInput, setGoogleMapsUrlInput] = useState('');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [showCoordinateInputs, setShowCoordinateInputs] = useState(false);

  // Sync coords when governorate changes if coordinates are at 0 or default
  useEffect(() => {
    if (!latitude || !longitude) {
      const defaultCoord = GOVERNORATE_COORDINATES[governorate] || { lat: 33.5138, lng: 36.2765 };
      onCoordinatesChange(defaultCoord.lat, defaultCoord.lng);
    }
  }, [governorate]);

  // Color theme classes
  const colorTheme = {
    teal: {
      border: 'border-[#00FFD2]/30',
      focusBorder: 'focus:border-[#00FFD2]',
      text: 'text-[#00FFD2]',
      bg: 'bg-[#00FFD2]/10',
      btn: 'bg-[#00FFD2] hover:bg-[#00e6bd] text-black',
      badge: 'bg-[#00FFD2]/15 text-[#00FFD2] border-[#00FFD2]/30'
    },
    purple: {
      border: 'border-purple-500/30',
      focusBorder: 'focus:border-purple-500',
      text: 'text-purple-400',
      bg: 'bg-purple-500/10',
      btn: 'bg-purple-500 hover:bg-purple-400 text-white',
      badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
    },
    amber: {
      border: 'border-amber-400/30',
      focusBorder: 'focus:border-amber-400',
      text: 'text-amber-400',
      bg: 'bg-amber-400/10',
      btn: 'bg-amber-400 hover:bg-amber-300 text-black',
      badge: 'bg-amber-400/15 text-amber-300 border-amber-400/30'
    },
    pink: {
      border: 'border-[#ff2a5f]/30',
      focusBorder: 'focus:border-[#ff2a5f]',
      text: 'text-[#ff2a5f]',
      bg: 'bg-[#ff2a5f]/10',
      btn: 'bg-[#ff2a5f] hover:bg-[#e01f50] text-white',
      badge: 'bg-[#ff2a5f]/15 text-[#ff2a5f] border-[#ff2a5f]/30'
    },
    emerald: {
      border: 'border-emerald-500/30',
      focusBorder: 'focus:border-emerald-500',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      btn: 'bg-emerald-500 hover:bg-emerald-400 text-black',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    }
  }[accentColor];

  // Handle GPS location
  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      alert('خدمة تحديد الموقع الجغرافي (GPS) غير مدعومة في متصفحك.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        onCoordinatesChange(lat, lng);
        setIsLocating(false);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        // Fallback to governorate coordinates if GPS denied
        const defaultCoord = GOVERNORATE_COORDINATES[governorate] || { lat: 33.5138, lng: 36.2765 };
        onCoordinatesChange(defaultCoord.lat, defaultCoord.lng);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Parse Google Maps Link or Coordinates input
  const handleParseGoogleMapsUrl = (input: string) => {
    setGoogleMapsUrlInput(input);
    const trimmed = input.trim();
    if (!trimmed) return;

    // Pattern 1: Direct coordinates like "33.5138, 36.2765" or "33.5138 36.2765"
    const directCoordsMatch = trimmed.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
    if (directCoordsMatch) {
      const lat = parseFloat(directCoordsMatch[1]);
      const lng = parseFloat(directCoordsMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        onCoordinatesChange(lat, lng);
        return;
      }
    }

    // Pattern 2: Google Maps URL containing @lat,lng or q=lat,lng
    const urlCoordMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || trimmed.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (urlCoordMatch) {
      const lat = parseFloat(urlCoordMatch[1]);
      const lng = parseFloat(urlCoordMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        onCoordinatesChange(lat, lng);
      }
    }
  };

  // Open location directly in Google Maps for visual confirmation
  const handleOpenGoogleMapsPreview = () => {
    const lat = latitude || GOVERNORATE_COORDINATES[governorate]?.lat || 33.5138;
    const lng = longitude || GOVERNORATE_COORDINATES[governorate]?.lng || 36.2765;
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  // Generate interactive embedded Google Maps iframe URL
  const currentLat = latitude || GOVERNORATE_COORDINATES[governorate]?.lat || 33.5138;
  const currentLng = longitude || GOVERNORATE_COORDINATES[governorate]?.lng || 36.2765;
  const mapIframeSrc = `https://maps.google.com/maps?q=${currentLat},${currentLng}&z=15&output=embed&t=${mapType === 'satellite' ? 'k' : 'm'}`;

  return (
    <div className={`bg-[#050707] border ${colorTheme.border} rounded-2xl p-3.5 sm:p-4 space-y-3 font-['Cairo']`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${colorTheme.bg} ${colorTheme.text}`}>
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">{title}</h4>
            <p className="text-[10px] text-gray-400">
              حدد الموقع الدقيق لتسهيل وصول اللاعبين والفرق عبر الخريطة والـ GPS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleGetLiveLocation}
            disabled={isLocating}
            className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer border border-emerald-500/30 disabled:opacity-50"
            title="تحديد الموقع الجغرافي الحالي"
          >
            <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'جاري التحديد...' : 'موقعي الحالي'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenGoogleMapsPreview}
            className="px-2.5 py-1 rounded-xl bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer border border-blue-500/30"
            title="فتح الموقع في تطبيق خرائط Google"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>معاينة Google</span>
          </button>
        </div>
      </div>

      {/* Governorate & Detailed Address inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {onGovernorateChange && (
          <div>
            <label className="block text-[11px] font-semibold text-gray-300 mb-1">
              المحافظة السورية
            </label>
            <select
              value={governorate}
              onChange={(e) => {
                const newGov = e.target.value as SyrianGovernorate;
                onGovernorateChange(newGov);
                const coords = GOVERNORATE_COORDINATES[newGov];
                if (coords) {
                  onCoordinatesChange(coords.lat, coords.lng);
                }
              }}
              className={`w-full bg-[#0d1211] border border-white/15 rounded-xl py-2 px-3 text-xs text-white ${colorTheme.focusBorder} focus:outline-none cursor-pointer`}
            >
              {SYRIAN_GOVERNORATES.map((gov) => (
                <option key={gov} value={gov}>
                  {gov}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={onGovernorateChange ? '' : 'sm:col-span-2'}>
          <label className="block text-[11px] font-semibold text-gray-300 mb-1">
            العنوان التفصيلي وأقرب نقطة دالة
          </label>
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 absolute right-3 top-2.5 text-gray-500" />
            <input
              type="text"
              value={locationDetails}
              onChange={(e) => onLocationDetailsChange(e.target.value)}
              placeholder="مثال: دمشق - المزة فيلات غربية - بجانب حديقة الجلاء"
              className={`w-full bg-[#0d1211] border border-white/15 rounded-xl py-2 pr-8 pl-3 text-xs text-white placeholder-gray-500 ${colorTheme.focusBorder} focus:outline-none`}
            />
          </div>
        </div>
      </div>

      {/* Interactive Google Map Preview */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0d1211] h-48 sm:h-56 shadow-inner">
        <iframe
          title="Google Map Location Picker Preview"
          src={mapIframeSrc}
          className="w-full h-full border-0 filter contrast-105"
          loading="lazy"
        />

        {/* Map Type Switcher Controls */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/80 backdrop-blur-md p-1 rounded-xl border border-white/20 z-10">
          <button
            type="button"
            onClick={() => setMapType('roadmap')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              mapType === 'roadmap' ? 'bg-[#00FFD2] text-black' : 'text-gray-300 hover:text-white'
            }`}
          >
            خريطة
          </button>
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              mapType === 'satellite' ? 'bg-[#00FFD2] text-black' : 'text-gray-300 hover:text-white'
            }`}
          >
            قمر صناعي
          </button>
        </div>

        {/* Floating Pin Indicator & Coordinates Badge */}
        <div className="absolute bottom-2 right-2 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/20 text-[10px] font-mono text-gray-300 flex items-center gap-1.5 z-10">
          <MapPin className={`w-3 h-3 ${colorTheme.text}`} />
          <span>
            {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
          </span>
        </div>
      </div>

      {/* Paste Google Maps link or Coordinates shortcut */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-gray-400 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>لصق رابط موقع خرائط Google أو إحداثيات GPS:</span>
          </span>
          <button
            type="button"
            onClick={() => setShowCoordinateInputs(!showCoordinateInputs)}
            className={`${colorTheme.text} hover:underline text-[10px] font-bold cursor-pointer`}
          >
            {showCoordinateInputs ? 'إخفاء الإحداثيات اليدوية' : 'تعديل خط الطول والعرض يدوياً'}
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={googleMapsUrlInput}
            onChange={(e) => handleParseGoogleMapsUrl(e.target.value)}
            placeholder="انسخ والصق رابط خرائط Google (مثال: https://maps.app.goo.gl/... أو 33.5138, 36.2765)"
            className={`w-full bg-[#0d1211] border border-white/15 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500 ${colorTheme.focusBorder} focus:outline-none font-mono`}
          />
        </div>

        {showCoordinateInputs && (
          <div className="grid grid-cols-2 gap-2 pt-1 animate-fadeIn">
            <div>
              <label className="block text-[10px] text-gray-400 mb-0.5">خط العرض (Latitude)</label>
              <input
                type="number"
                step="0.000001"
                value={latitude || ''}
                onChange={(e) => onCoordinatesChange(parseFloat(e.target.value) || 0, longitude)}
                placeholder="33.513800"
                className="w-full bg-[#0d1211] border border-white/15 rounded-xl py-1.5 px-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00FFD2]"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-0.5">خط الطول (Longitude)</label>
              <input
                type="number"
                step="0.000001"
                value={longitude || ''}
                onChange={(e) => onCoordinatesChange(latitude, parseFloat(e.target.value) || 0)}
                placeholder="36.276500"
                className="w-full bg-[#0d1211] border border-white/15 rounded-xl py-1.5 px-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00FFD2]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
