'use client';

import * as React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { create as createZustandStore } from 'zustand';
import {
  Sparkles,
  Plus,
  Minus,
  Trash2,
  User,
  Check,
  Copy,
  Search,
  Settings,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Heart,
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Info,
  Lock,
  Unlock,
  Mail,
  Eye,
  EyeOff,
  ExternalLink,
  Code,
  Terminal,
  Layers,
  Globe,
  RefreshCw,
  Sun,
  Moon,
  Server,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export const WHITELISTED_LUCIDE_ICONS = {
  Sparkles,
  Plus,
  Minus,
  Trash2,
  User,
  Check,
  Copy,
  Search,
  Settings,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Heart,
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Info,
  Lock,
  Unlock,
  Mail,
  Eye,
  EyeOff,
  ExternalLink,
  Code,
  Terminal,
  Layers,
  Globe,
  RefreshCw,
  Sun,
  Moon,
  Server,
  Zap,
};

export const PLAYGROUND_UI_COMPONENTS = {
  Button,
  Card,
  Badge,
  Input,
};

export const RUNNER_EXTERNAL_MODULES: Record<string, unknown> = {
  react: React,
  'react-dom': ReactDOMClient,
  'react-dom/client': ReactDOMClient,
  zustand: { create: createZustandStore, default: { create: createZustandStore } },
  'lucide-react': WHITELISTED_LUCIDE_ICONS,
  '@playground/ui': PLAYGROUND_UI_COMPONENTS,
};
