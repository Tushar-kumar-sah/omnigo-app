// ─── Inspection Steps ─────────────────────────────────────
export type InspectionStep = {
  id: number;
  label: string;
  type: 'photo' | 'video' | 'damage';
  description: string;
  required: boolean;
  frameGuide: string;
};

export const INSPECTION_STEPS: InspectionStep[] = [
  { id: 1, label: 'Front', type: 'photo', description: 'Bumper & hood condition', required: true, frameGuide: 'Position front of vehicle within the frame' },
  { id: 2, label: 'Rear', type: 'photo', description: 'Bumper & trunk condition', required: true, frameGuide: 'Position rear of vehicle within the frame' },
  { id: 3, label: 'Left Side', type: 'photo', description: 'Door & panel condition', required: true, frameGuide: 'Position left side of vehicle within the frame' },
  { id: 4, label: 'Right Side', type: 'photo', description: 'Door & panel condition', required: true, frameGuide: 'Position right side of vehicle within the frame' },
  { id: 5, label: '360° Walkaround', type: 'video', description: 'Continuous proof (~15-20s)', required: true, frameGuide: 'Walk slowly around the entire vehicle' },
  { id: 6, label: 'License Plate', type: 'photo', description: 'Close-up for verification', required: true, frameGuide: 'Focus on the license plate number' },
  { id: 7, label: 'Odometer', type: 'photo', description: 'Mileage record', required: false, frameGuide: 'Capture the dashboard odometer reading' },
  { id: 8, label: 'Existing Damage', type: 'damage', description: 'Mark & photograph damage', required: true, frameGuide: 'Tap areas with damage on the diagram' },
];

// ─── Condition Checklist ──────────────────────────────────
export type ChecklistItem = {
  id: string;
  label: string;
  type: 'toggle' | 'select';
  options?: string[];
};

export const CONDITION_CHECKLIST: ChecklistItem[] = [
  { id: 'tyres', label: 'Tyres Inflated', type: 'toggle' },
  { id: 'keys', label: 'Keys Present', type: 'toggle' },
  { id: 'windows', label: 'Windows Up', type: 'toggle' },
  { id: 'fuel', label: 'Fuel Level', type: 'select', options: ['Empty', 'Low', 'Quarter', 'Half', 'Three-Quarter', 'Full'] },
  { id: 'lights', label: 'Lights Working', type: 'toggle' },
  { id: 'mirrors', label: 'Mirrors Intact', type: 'toggle' },
];

// ─── Settings Items ───────────────────────────────────────
export const SETTINGS_ITEMS = [
  { id: 'notifications', label: 'Notification Preferences', icon: 'notifications-outline' as const, route: '/settings/notifications' },
  { id: 'language', label: 'Language', icon: 'language-outline' as const, route: '/settings/language' },
  { id: 'privacy', label: 'Privacy Policy', icon: 'shield-outline' as const, route: '/settings/privacy' },
  { id: 'terms', label: 'Terms & Conditions', icon: 'document-text-outline' as const, route: '/settings/terms' },
  { id: 'support', label: 'Help & Support', icon: 'help-circle-outline' as const, route: '/settings/support' },
  { id: 'about', label: 'About OmniGo', icon: 'information-circle-outline' as const, route: '/settings/about' },
];
