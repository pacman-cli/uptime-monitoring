export interface Monitor {
  id: string;
  name: string;
  url: string;
  status: 'up' | 'down';
  latency: number;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: 'eye' | 'bell' | 'chart';
}

export interface TimelineStep {
  id: string;
  label: string;
  title: string;
  description: string;
  metric: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  initials: string;
  gradient: string;
}

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: string;
  period?: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}
