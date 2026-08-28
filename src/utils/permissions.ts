import { UserProfile, UserRole } from '../types';

// Strictly check if the user is a system Administrator
export function isUserAdmin(user?: Partial<UserProfile> | null): boolean {
  if (!user) return false;
  if (user.isAdmin === true) return true;
  if (user.role === 'admin' || user.role === 'أدمن') return true;

  const email = (user.email || '').trim().toLowerCase();
  const phone = (user.phone || '').trim().replace(/[\s\-_]/g, '');

  return (
    email === 'family2016amer@gmail.com' ||
    email.includes('family2016amer') ||
    phone === '0945688090' ||
    phone === '+963945688090' ||
    phone === '963945688090' ||
    user.id === 'admin-0945688090'
  );
}

// Check if user is an authorized Advertiser / Organizer
export function isUserAdvertiser(user?: Partial<UserProfile> | null): boolean {
  if (!user) return false;
  if (isUserAdmin(user)) return true;

  const role = user.role as string;
  return (
    role === 'advertiser' ||
    role === 'announcer_pitch' ||
    role === 'announcer_academy' ||
    role === 'league_manager' ||
    role === 'organizer' ||
    role === 'صاحب ملعب' ||
    role === 'owner'
  );
}

// Permission to create a playground (Pitch) - Allowed for Advertisers & Admins only
export function canUserCreatePlayground(user?: Partial<UserProfile> | null): boolean {
  if (!user) return false;
  if (isUserAdmin(user)) return true;
  const role = user.role as string;
  return (
    role === 'advertiser' ||
    role === 'announcer_pitch' ||
    role === 'organizer' ||
    role === 'صاحب ملعب' ||
    role === 'owner'
  );
}

// Permission to create a league (Tournament) - Allowed for Advertisers & Admins only
export function canUserCreateLeague(user?: Partial<UserProfile> | null): boolean {
  if (!user) return false;
  if (isUserAdmin(user)) return true;
  const role = user.role as string;
  return (
    role === 'advertiser' ||
    role === 'league_manager' ||
    role === 'organizer'
  );
}

// Permission to create an academy - Allowed for Advertisers & Admins only
export function canUserCreateAcademy(user?: Partial<UserProfile> | null): boolean {
  if (!user) return false;
  if (isUserAdmin(user)) return true;
  const role = user.role as string;
  return (
    role === 'advertiser' ||
    role === 'announcer_academy' ||
    role === 'organizer'
  );
}

// Permission to Edit or Delete or Modify existing items - STRICTLY ADMIN ONLY
export function canUserEditOrDelete(user?: Partial<UserProfile> | null): boolean {
  return isUserAdmin(user);
}

// Get user-friendly role badge text
export function getUserRoleBadge(user?: Partial<UserProfile> | null): {
  label: string;
  colorClass: string;
  description: string;
  canCreate: boolean;
  canEditDelete: boolean;
} {
  if (isUserAdmin(user)) {
    return {
      label: 'المدير العام (Super Admin)',
      colorClass: 'bg-[#ff2a5f]/20 border-[#ff2a5f]/40 text-[#ff2a5f]',
      description: 'صلاحيات كاملة: إنشاء الملاعب والبطولات والأكاديميات، وتعديل وحذف وكتابة كافة البيانات.',
      canCreate: true,
      canEditDelete: true
    };
  }

  const role = user?.role as string;
  if (role === 'advertiser' || role === 'announcer_pitch' || role === 'announcer_academy' || role === 'league_manager' || role === 'organizer' || role === 'صاحب ملعب') {
    let specificLabel = 'معلن معتمد (Advertiser)';
    if (role === 'announcer_pitch' || role === 'صاحب ملعب') specificLabel = 'معلن ملاعب كرة قدم';
    else if (role === 'announcer_academy') specificLabel = 'معلن أكاديميات ومدربين';
    else if (role === 'league_manager') specificLabel = 'منظم دوريات وبطولات';

    return {
      label: specificLabel,
      colorClass: 'bg-amber-400/20 border-amber-400/40 text-amber-300',
      description: 'صلاحية معلن: مصرح لك بإنشاء الملاعب والدوريات والأكاديميات والإعلان عنها.',
      canCreate: true,
      canEditDelete: false
    };
  }

  return {
    label: 'لاعب / مستخدم عادي (User)',
    colorClass: 'bg-[#00FFD2]/15 border-[#00FFD2]/30 text-[#00FFD2]',
    description: 'مستخدم عادي: يمكنك حجز الملاعب، الانضمام للبطولات، التسجيل بالأكاديميات، والمباريات الودية.',
    canCreate: false,
    canEditDelete: false
  };
}
