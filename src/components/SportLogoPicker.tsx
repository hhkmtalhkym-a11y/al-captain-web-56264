import React, { useState } from 'react';
import { Upload, Image as ImageIcon, CheckCircle2, Sparkles, Trophy, Shirt, Shield, Eye } from 'lucide-react';
import { PRESET_SPORT_LOGOS } from '../constants/sportsLogos';
import { SportLogoItem } from '../types';
import { readImageAsBase64 } from '../utils/helpers';

interface SportLogoPickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
  accentColor?: 'teal' | 'pink' | 'purple' | 'amber';
  helperText?: string;
}

export default function SportLogoPicker({
  value,
  onChange,
  label = 'شعار أو صورة رياضية',
  required = true,
  accentColor = 'teal',
  helperText = 'يمكنك رفع صورة من جهازك أو اختيار شعار رياضي جاهز من المكتبة'
}: SportLogoPickerProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'upload'>('presets');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [uploadError, setUploadError] = useState<string>('');

  const categories = ['الكل', 'كؤوس وجوائز', 'كرات ومعدات', 'ملاعب ومنشآت', 'شعارات أندية', 'لاعبين وحكام'];

  const filteredLogos = selectedCategory === 'الكل'
    ? PRESET_SPORT_LOGOS
    : PRESET_SPORT_LOGOS.filter((l) => l.category === selectedCategory);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadError('');
      const base64 = await readImageAsBase64(file);
      onChange(base64);
    } catch (err: any) {
      setUploadError(err.message || 'فشل في قراءة الصورة المرفوعة');
    }
  };

  const getBorderColor = () => {
    switch (accentColor) {
      case 'pink':
        return 'border-[#ff2a5f]';
      case 'purple':
        return 'border-purple-500';
      case 'amber':
        return 'border-amber-400';
      default:
        return 'border-[#00FFD2]';
    }
  };

  const getBgActiveColor = () => {
    switch (accentColor) {
      case 'pink':
        return 'bg-[#ff2a5f] text-white';
      case 'purple':
        return 'bg-purple-600 text-white';
      case 'amber':
        return 'bg-amber-400 text-black';
      default:
        return 'bg-[#00FFD2] text-black';
    }
  };

  return (
    <div className="bg-[#050707] p-4 rounded-2xl border border-white/10 space-y-3">
      {/* Label and Selected Preview */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-white font-['Cairo']">
            {label} {required && <span className="text-red-400 font-normal">(إجباري)</span>}
          </label>
          <p className="text-[11px] text-gray-400 mt-0.5">{helperText}</p>
        </div>

        {value && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> تم التحديد
            </span>
            <div className={`w-11 h-11 rounded-xl overflow-hidden border-2 ${getBorderColor()} shadow-md`}>
              <img src={value} alt="Selected Preview" className="w-full h-full object-cover" />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#0d1211] p-1 rounded-xl border border-white/5 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'presets' ? getBgActiveColor() : 'text-gray-400 hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>شعارات ورموز رياضية جاهزة ({PRESET_SPORT_LOGOS.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'upload' ? getBgActiveColor() : 'text-gray-400 hover:text-white'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>رفع صورة من المعرض</span>
        </button>
      </div>

      {/* Tab 1: Preset Logos Grid */}
      {activeTab === 'presets' && (
        <div className="space-y-3 pt-1">
          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-white/20 text-white border border-white/30'
                    : 'bg-[#0d1211] text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid of 16 Sports Badges */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-1 bg-[#0d1211] rounded-xl border border-white/5">
            {filteredLogos.map((logo) => {
              const isSelected = value === logo.url;
              return (
                <button
                  key={logo.id}
                  type="button"
                  onClick={() => onChange(logo.url)}
                  className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all p-0.5 ${
                    isSelected
                      ? `${getBorderColor()} scale-105 shadow-lg shadow-emerald-500/20`
                      : 'border-white/10 hover:border-white/40 opacity-85 hover:opacity-100'
                  }`}
                  title={logo.name}
                >
                  <img src={logo.url} alt={logo.name} className="w-full h-full object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-emerald-500 text-black rounded-full p-0.5 shadow">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] text-white py-0.5 text-center truncate px-0.5">
                    {logo.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Upload from Device */}
      {activeTab === 'upload' && (
        <div className="pt-1">
          <label className="border-2 border-dashed border-white/20 hover:border-white/40 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-[#0d1211]/60 hover:bg-[#0d1211] transition-all">
            <Upload className="w-6 h-6 text-gray-400 mb-2" />
            <span className="text-xs font-bold text-white">اضغط لاختيار صورة من جهازك</span>
            <span className="text-[10px] text-gray-500 mt-0.5">PNG, JPG, WEBP حتى 5 ميغابايت</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
          {uploadError && (
            <p className="text-[11px] text-red-400 mt-1">{uploadError}</p>
          )}
        </div>
      )}
    </div>
  );
}
