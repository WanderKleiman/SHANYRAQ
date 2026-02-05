import {
  MapPin, FileText, Menu, X, Info, Users, Phone, Building, Shield,
  Map, ChevronLeft, ChevronRight, ExternalLink, ShieldCheck, Share2,
  ArrowLeft, Heart, Activity, Zap, Loader, CreditCard, Check,
  FileEdit, MessageCircle, Mail, Instagram, Settings
} from 'lucide-react';

// Маппинг старых CSS классов на React компоненты
const iconMap = {
  'map-pin': MapPin,
  'file-text': FileText,
  'menu': Menu,
  'x': X,
  'info': Info,
  'users': Users,
  'phone': Phone,
  'building': Building,
  'shield': Shield,
  'map': Map,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'external-link': ExternalLink,
  'shield-check': ShieldCheck,
  'share-2': Share2,
  'arrow-left': ArrowLeft,
  'heart': Heart,
  'activity': Activity,
  'zap': Zap,
  'loader': Loader,
  'credit-card': CreditCard,
  'check': Check,
  'file-edit': FileEdit,
  'message-circle': MessageCircle,
  'mail': Mail,
  'instagram': Instagram,
  'settings': Settings,
};

// Универсальный компонент иконки
export default function Icon({ name, size = 20, className = '', ...props }) {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  return <IconComponent size={size} className={className} {...props} />;
}
