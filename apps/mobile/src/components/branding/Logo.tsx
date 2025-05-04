import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { theme } from '../../styles/theme';

const Logo = ({ width = 32, height = 32 }) => (
  <Svg width={width} height={height} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={theme.colors.gradientStart} />
        <Stop offset="100%" stopColor={theme.colors.gradientEnd} />
      </LinearGradient>
    </Defs>
    <Path
      d="M50,10 C70,10 85,25 85,45 C85,65 70,80 50,80 C30,80 15,65 15,45 C15,25 30,10 50,10 Z M50,30 C60,30 67,37 67,47 C67,57 60,64 50,64 C40,64 33,57 33,47 C33,37 40,30 50,30 Z"
      fill="url(#grad)"
    />
    <Path
      d="M30,20 C40,35 60,35 70,20"
      stroke="#fff"
      strokeWidth={3}
      fill="none"
    />
  </Svg>
);

export default Logo;
