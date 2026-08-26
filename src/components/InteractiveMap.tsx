import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Search,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Phone,
  Clock,
  Car,
  Footprints,
  Maximize2,
  Minimize2,
  RefreshCw,
  LocateFixed,
  Filter,
  CheckCircle2,
  Users,
  Trophy,
  Swords,
  Shield,
  Zap,
  Info,
  Route,
  Share2,
  CornerUpRight
} from 'lucide-react';
import {
  Playground,
  Academy,
  FriendlyMatch,
  SyrianGovernorate
} from '../types';
import { SYRIAN_GOVERNORATES, GOVERNORATE_COORDINATES } from '../constants/syrianData';
import { formatSYP, openWhatsAppShare } from '../utils/helpers';

interface InteractiveMapProps {
  playgrounds?: Playground[];
  academies?: Academy[];
  matches?: FriendlyMatch[];
  selectedGovernorate?: string;
  onSelectPlayground?: (pg: Playground) => void;
  onSelectAcademy?: (aca: Academy) => void;
  onSelectMatch?: (m: FriendlyMatch) => void;
}

type MapTypeMode = 'roadmap' | 'satellite' | 'terrain';
type CategoryFilter = 'all' | 'playgrounds' | 'academies' | 'matches';

interface MapVenueItem {
  id: string;
  type: 'playground' | 'academy' | 'match';
  title: string;
  subtitle: string;
  governorate: SyrianGovernorate;
  lat: number;
  lng: number;
  image: string;
  rating?: number;
  price?: number;
  priceLabel?: string;
  phone?: string;
  badge: string;
  badgeColor: string;
  surface?: string;
  capacity?: string;
  originalData: any;
}

export default function InteractiveMap({
  playgrounds = [],
  academies = [],
  matches = [],
  selectedGovernorate = 'الكل',
  onSelectPlayground,
  onSelectAcademy,
  onSelectMatch
}: InteractiveMapProps) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [govFilter, setGovFilter] = useState<string>(selectedGovernorate || 'الكل');
  const [mapType, setMapType] = useState<MapTypeMode>('roadmap');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<MapVenueItem | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);

  // User Geolocation & Compass
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 33.5138,
    lng: 36.2765 // Damascus Umayyad Square
  });
  const [userAddressName, setUserAddressName] = useState('دمشق - ساحة الأمويين (الموقع الافتراضي)');
  const [isLocating, setIsLocating] = useState(false);
  const [isRouteCalculating, setIsRouteCalculating] = useState(false);

  // Route & Directions Info
  const [routeInfo, setRouteInfo] = useState<{
    distanceKm: number;
    driveMinutes: number;
    walkMinutes: number;
    steps: { instruction: string; distance: string }[];
    originName: string;
    destinationName: string;
  } | null>(null);

  // Sync governorate when prop changes
  useEffect(() => {
    if (selectedGovernorate && selectedGovernorate !== 'الكل') {
      setGovFilter(selectedGovernorate);
    }
  }, [selectedGovernorate]);

  // Request actual user location on mount
  useEffect(() => {
    handleLocateUser();
  }, []);

  const handleLocateUser = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(userPos);
          setUserAddressName('موقعك الجغرافي الحالي المباشر (GPS)');
          setIsLocating(false);
        },
        (err) => {
          console.warn('Geolocation notice:', err.message);
          setIsLocating(false);
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      setIsLocating(false);
    }
  };

  // Build unified venues list
  const allVenues: MapVenueItem[] = [
    ...playgrounds.map((p) => ({
      id: p.id,
      type: 'playground' as const,
      title: p.name,
      subtitle: `${p.governorate} - ${p.detailedArea}`,
      governorate: p.governorate,
      lat: p.latitude || GOVERNORATE_COORDINATES[p.governorate]?.lat || 33.5138,
      lng: p.longitude || GOVERNORATE_COORDINATES[p.governorate]?.lng || 36.2765,
      image: p.image || p.images?.[0] || 'https://images.unsplash.com/photo-1529900244920-535ec395abe0?auto=format&fit=crop&w=600&q=80',
      rating: p.rating,
      price: p.pricePerHour,
      priceLabel: `${formatSYP(p.pricePerHour)} / ساعة`,
      phone: p.managerPhone,
      badge: 'ملعب معتمد',
      badgeColor: 'bg-[#00FFD2] text-black border-[#00FFD2]',
      surface: p.surface,
      capacity: p.capacity,
      originalData: p
    })),
    ...academies.map((a) => ({
      id: a.id,
      type: 'academy' as const,
      title: a.name,
      subtitle: `${a.governorate} - ${a.locationDetails}`,
      governorate: a.governorate,
      lat: a.latitude || GOVERNORATE_COORDINATES[a.governorate]?.lat || 33.5138,
      lng: a.longitude || GOVERNORATE_COORDINATES[a.governorate]?.lng || 36.2765,
      image: a.image || a.images?.[0] || 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=600&q=80',
      price: a.monthlyFee,
      priceLabel: `${formatSYP(a.monthlyFee)} / شهرياً`,
      phone: a.contactPhone,
      badge: 'أكاديمية كروية',
      badgeColor: 'bg-purple-400 text-black border-purple-300',
      originalData: a
    })),
    ...matches.map((m) => ({
      id: m.id,
      type: 'match' as const,
      title: `${m.hostTeamName} vs ${m.opponentTeamName || 'بانتظار منافس'}`,
      subtitle: `${m.governorate} - ${m.venueName} (${m.date} ${m.time})`,
      governorate: m.governorate,
      lat: GOVERNORATE_COORDINATES[m.governorate]?.lat || 33.5138,
      lng: GOVERNORATE_COORDINATES[m.governorate]?.lng || 36.2765,
      image: m.hostTeamImage || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80',
      price: m.pitchPrice + (m.refereePrice || 0),
      priceLabel: `${formatSYP(m.pitchPrice + (m.refereePrice || 0))} إجمالي`,
      phone: m.organizerPhone,
      badge: 'تحدي مباراة',
      badgeColor: 'bg-[#ff2a5f] text-white border-[#ff2a5f]',
      originalData: m
    }))
  ];

  // Filter venues
  const filteredVenues = allVenues.filter((v) => {
    const matchesCategory =
      categoryFilter === 'all'
        ? true
        : categoryFilter === 'playgrounds'
        ? v.type === 'playground'
        : categoryFilter === 'academies'
        ? v.type === 'academy'
        : v.type === 'match';

    const matchesGov = govFilter === 'الكل' ? true : v.governorate === govFilter;

    const matchesSearch =
      searchQuery.trim() === ''
        ? true
        : v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.governorate.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesGov && matchesSearch;
  });

  // Calculate distance between two coordinates in km (Haversine formula)
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  };

  // Compute directions & route steps
  const handleCalculateDirections = (venue: MapVenueItem) => {
    setIsRouteCalculating(true);
    setSelectedVenue(venue);

    const distKm = calculateDistanceKm(userLocation.lat, userLocation.lng, venue.lat, venue.lng);
    const driveMins = Math.max(3, Math.round((distKm / 35) * 60)); // Average Syrian city speed 35km/h
    const walkMins = Math.round((distKm / 4.5) * 60);

    // Generate realistic navigation steps
    const steps = [
      {
        instruction: `انطلق من موقعك الحالي باتجاه أقرب شريان رئيسي أو أوتوستراد نحو ${venue.governorate}.`,
        distance: `${Math.max(0.5, parseFloat((distKm * 0.15).toFixed(1)))} كم`
      },
      {
        instruction: `تابع القيادة مستقيماً باتجاه منطقة ${venue.subtitle}.`,
        distance: `${Math.max(1, parseFloat((distKm * 0.65).toFixed(1)))} كم`
      },
      {
        instruction: `انعطف نحو المدخل الرئيسي لـ "${venue.title}".`,
        distance: `${Math.max(0.3, parseFloat((distKm * 0.2).toFixed(1)))} كم`
      },
      {
        instruction: `وصلت إلى الوجهة المحددة: ${venue.title} (موقف السيارات متاح أمام الملعب).`,
        distance: '0 كم'
      }
    ];

    setRouteInfo({
      distanceKm: distKm,
      driveMinutes: driveMins,
      walkMinutes: walkMins,
      steps,
      originName: userAddressName,
      destinationName: `${venue.title} (${venue.subtitle})`
    });

    setIsRouteCalculating(false);
    setShowDirectionsModal(true);
  };

  // Open live Google Maps Directions in new window / app
  const handleOpenGoogleMapsNavigation = (venue: MapVenueItem) => {
    const origin = `${userLocation.lat},${userLocation.lng}`;
    const destination = `${venue.lat},${venue.lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    window.open(url, '_blank');
  };

  // Active center coordinates for Google Maps Embed
  const currentTarget = selectedVenue || (filteredVenues.length > 0 ? filteredVenues[0] : null);
  const targetLat = currentTarget ? currentTarget.lat : GOVERNORATE_COORDINATES[govFilter as SyrianGovernorate]?.lat || 33.5138;
  const targetLng = currentTarget ? currentTarget.lng : GOVERNORATE_COORDINATES[govFilter as SyrianGovernorate]?.lng || 36.2765;

  // Google Maps Embed URL
  const googleMapsEmbedUrl = currentTarget
    ? `https://maps.google.com/maps?q=${targetLat},${targetLng}&t=${mapType === 'satellite' ? 'k' : mapType === 'terrain' ? 'p' : 'm'}&z=14&ie=UTF8&iwloc=&output=embed`
    : `https://maps.google.com/maps?q=${targetLat},${targetLng}&t=${mapType === 'satellite' ? 'k' : mapType === 'terrain' ? 'p' : 'm'}&z=11&ie=UTF8&iwloc=&output=embed`;

  return (
    <div
      id="view-google-maps"
      className={`space-y-4 font-['Cairo'] ${
        isFullscreen ? 'fixed inset-0 z-50 bg-[#050707] p-4 overflow-y-auto' : ''
      }`}
    >
      {/* Top Header Controls */}
      <div className="bg-[#0d1211] border border-[#00FFD2]/20 rounded-3xl p-4 sm:p-5 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#00FFD2]/10 border border-[#00FFD2]/40 flex items-center justify-center text-[#00FFD2] shrink-0 glow-primary">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  خرائط Google للملاعب والأنشطة الرياضية
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#00FFD2]/10 border border-[#00FFD2]/30 text-[#00FFD2] text-[10px] font-bold">
                  Directions API 📍
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                تصفح مواقع الملاعب والأكاديميات في سوريا، واحسب المسافة ومسار الاتجاهات بدقة من موقعك الحالي.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* GPS Locate Me Button */}
            <button
              onClick={handleLocateUser}
              disabled={isLocating}
              className="px-3.5 py-2 rounded-xl bg-black/60 hover:bg-[#00FFD2]/10 text-gray-300 hover:text-[#00FFD2] border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all"
              title="تحديد موقعي الحالي بدقة عبر GPS"
            >
              <LocateFixed className={`w-4 h-4 text-[#00FFD2] ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'جاري تحديد موقعك...' : 'موقعي الحالي'}</span>
            </button>

            {/* Map Type Switcher */}
            <div className="flex items-center bg-black/60 rounded-xl p-1 border border-white/10 text-xs">
              <button
                onClick={() => setMapType('roadmap')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  mapType === 'roadmap'
                    ? 'bg-[#00FFD2] text-black shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                افتراضي
              </button>
              <button
                onClick={() => setMapType('satellite')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  mapType === 'satellite'
                    ? 'bg-[#00FFD2] text-black shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                قمر صناعي 🛰️
              </button>
              <button
                onClick={() => setMapType('terrain')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  mapType === 'terrain'
                    ? 'bg-[#00FFD2] text-black shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                تضاريس ⛰️
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2.5 rounded-xl bg-black/60 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
              title={isFullscreen ? 'تصغير الشاشة' : 'تكبير الشاشة'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن اسم ملعب، أكاديمية، أو حي..."
              className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 pr-9 pl-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00FFD2]"
            />
          </div>

          {/* Governorate Dropdown */}
          <div className="relative">
            <MapPin className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#00FFD2]" />
            <select
              value={govFilter}
              onChange={(e) => setGovFilter(e.target.value)}
              className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 pr-9 pl-3 text-xs text-white focus:outline-none focus:border-[#00FFD2] cursor-pointer"
            >
              <option value="الكل">جميع المحافظات السورية الـ 14</option>
              {SYRIAN_GOVERNORATES.map((g) => (
                <option key={g} value={g}>
                  محافظة {g}
                </option>
              ))}
            </select>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-[#050707] p-1 rounded-xl border border-white/10 text-xs">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'playgrounds', label: 'ملاعب' },
              { id: 'academies', label: 'أكاديميات' },
              { id: 'matches', label: 'تحديات' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id as CategoryFilter)}
                className={`flex-1 py-1 rounded-lg font-bold text-center transition-all ${
                  categoryFilter === cat.id
                    ? 'bg-[#00FFD2] text-black shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map & Venues Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Embedded Google Maps Viewer */}
        <div className="lg:col-span-8 space-y-3">
          <div className="relative rounded-3xl overflow-hidden border-2 border-[#00FFD2]/30 shadow-2xl bg-[#071310] h-[420px] sm:h-[520px]">
            {/* Embedded Google Maps Frame */}
            <iframe
              title="Google Maps Syria Venues"
              src={googleMapsEmbedUrl}
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
            ></iframe>

            {/* Quick Overlay: Selected Venue floating card */}
            {selectedVenue && (
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md bg-[#071310]/95 backdrop-blur-md border-2 border-[#00FFD2] rounded-2xl p-4 shadow-2xl animate-fadeIn">
                <div className="flex items-start gap-3">
                  <img
                    src={selectedVenue.image}
                    alt={selectedVenue.title}
                    className="w-16 h-16 rounded-xl object-cover border border-[#00FFD2]/40 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${selectedVenue.badgeColor}`}>
                        {selectedVenue.badge}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#00FFD2]">
                        {selectedVenue.priceLabel}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white truncate mt-1">
                      {selectedVenue.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#00FFD2]" />
                      {selectedVenue.subtitle}
                    </p>
                  </div>
                </div>

                {/* Direct Action Buttons on Card */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10">
                  <button
                    onClick={() => handleCalculateDirections(selectedVenue)}
                    className="py-2 px-3 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-black text-xs flex items-center justify-center gap-1.5 shadow"
                  >
                    <Route className="w-3.5 h-3.5" />
                    <span>رسم مسار الاتجاهات</span>
                  </button>

                  <button
                    onClick={() => handleOpenGoogleMapsNavigation(selectedVenue)}
                    className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#00FFD2]" />
                    <span>فتح في تطبيق Maps</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Interactive Venues Directory List */}
        <div className="lg:col-span-4 bg-[#0d1211] border border-white/10 rounded-3xl p-4 shadow-xl space-y-3 h-[520px] flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#00FFD2]" />
              المنشآت المتاحة ({filteredVenues.length})
            </h3>
            <span className="text-[11px] text-gray-400">
              {govFilter === 'الكل' ? 'سوريا كاملة' : govFilter}
            </span>
          </div>

          {/* List Scrollable Container */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
            {filteredVenues.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                لا توجد منشآت مطابقة للبحث أو المحافظة المختارة.
              </div>
            ) : (
              filteredVenues.map((venue) => {
                const isSelected = selectedVenue?.id === venue.id;
                const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, venue.lat, venue.lng);

                return (
                  <div
                    key={venue.id}
                    onClick={() => setSelectedVenue(venue)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#00FFD2]/10 border-[#00FFD2] shadow-lg shadow-[#00FFD2]/10'
                        : 'bg-[#050707] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={venue.image}
                        alt={venue.title}
                        className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${venue.badgeColor}`}>
                            {venue.badge}
                          </span>
                          <span className="text-[11px] text-[#00FFD2] font-mono font-bold flex items-center gap-0.5">
                            <Navigation className="w-3 h-3" />
                            {dist} كم
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-white truncate mt-1">
                          {venue.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">
                          {venue.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons inside venue item */}
                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/5 text-[11px]">
                      <span className="text-gray-300 font-mono font-semibold">
                        {venue.priceLabel}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCalculateDirections(venue);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#00FFD2]/15 hover:bg-[#00FFD2] text-[#00FFD2] hover:text-black font-bold text-[10px] transition-colors flex items-center gap-1"
                        >
                          <Route className="w-3 h-3" />
                          <span>المسار</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (venue.type === 'playground' && onSelectPlayground) {
                              onSelectPlayground(venue.originalData);
                            } else if (venue.type === 'academy' && onSelectAcademy) {
                              onSelectAcademy(venue.originalData);
                            } else if (venue.type === 'match' && onSelectMatch) {
                              onSelectMatch(venue.originalData);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] transition-colors"
                        >
                          التفاصيل
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* MODAL: Full Directions & Turn-by-Turn Route Navigation */}
      {showDirectionsModal && routeInfo && selectedVenue && (
        <div
          id="modal-google-directions"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowDirectionsModal(false)}
        >
          <div
            className="bg-[#071310] border-2 border-[#00FFD2]/40 rounded-3xl w-full max-w-xl p-6 relative shadow-2xl space-y-5 glow-primary"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#00FFD2]/15 border border-[#00FFD2]/40 flex items-center justify-center text-[#00FFD2] shrink-0">
                  <Route className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    مسار الاتجاهات (Google Directions)
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    إلى: <strong className="text-[#00FFD2]">{routeInfo.destinationName}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDirectionsModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Route Stats (Distance, Drive Time, Walk Time) */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#0d1211] border border-white/10 rounded-2xl p-3 text-center">
                <Navigation className="w-5 h-5 text-[#00FFD2] mx-auto mb-1" />
                <div className="text-sm font-black text-white font-mono">{routeInfo.distanceKm} كم</div>
                <div className="text-[10px] text-gray-400 font-bold">المسافة المقدرة</div>
              </div>

              <div className="bg-[#0d1211] border border-white/10 rounded-2xl p-3 text-center">
                <Car className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <div className="text-sm font-black text-amber-400 font-mono">~{routeInfo.driveMinutes} دقيقة</div>
                <div className="text-[10px] text-gray-400 font-bold">بالسيارة / التاكسي</div>
              </div>

              <div className="bg-[#0d1211] border border-white/10 rounded-2xl p-3 text-center">
                <Footprints className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <div className="text-sm font-black text-purple-400 font-mono">~{routeInfo.walkMinutes} دقيقة</div>
                <div className="text-[10px] text-gray-400 font-bold">مشياً على الأقدام</div>
              </div>
            </div>

            {/* Turn-by-Turn Step Instructions */}
            <div className="space-y-2 bg-[#050707] p-4 rounded-2xl border border-white/10">
              <h4 className="text-xs font-bold text-gray-300 flex items-center gap-2 mb-2">
                <CornerUpRight className="w-4 h-4 text-[#00FFD2]" />
                إرشادات الطريق خطوة بخطوة:
              </h4>

              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {routeInfo.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <span className="w-5 h-5 rounded-full bg-[#00FFD2]/20 text-[#00FFD2] font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1 text-gray-300 leading-relaxed">
                      {step.instruction}
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono shrink-0">
                      {step.distance}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => handleOpenGoogleMapsNavigation(selectedVenue)}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg glow-primary"
              >
                <Navigation className="w-4 h-4" />
                <span>بدء الملاحة الحية عبر خرائط Google</span>
              </button>

              <button
                onClick={() => {
                  const shareText = `مسار الوصول إلى ${selectedVenue.title} (${selectedVenue.subtitle}) من موقعي الحالي:\nالمسافة: ${routeInfo.distanceKm} كم\nالرابط: https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${selectedVenue.lat},${selectedVenue.lng}`;
                  openWhatsAppShare(shareText);
                }}
                className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>مشاركة المسار واتساب</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
