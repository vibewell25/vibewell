import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

interface AnimateInProps {
  children: React.ReactNode;
  animation?: 'fade' | 'slide' | 'scale' | 'bounce';
  delay?: number;
  duration?: number;
  className?: string;
}

export {};
