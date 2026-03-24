export type LogicValue = 0 | 1;

export type LedColor = 'red' | 'blue' | 'green' | 'yellow' | 'pink' | 'white';

export interface ToggleSwitchData {
  type: 'toggleSwitch';
  value: LogicValue;
}

export interface PushButtonData {
  type: 'pushButton';
  value: LogicValue;
}

export interface LedData {
  type: 'led';
  color: LedColor;
  value: LogicValue;
}

export interface GateData {
  type: 'not' | 'and' | 'or';
  inputs: LogicValue[];
  output: LogicValue;
}

export type CircuitNodeData = ToggleSwitchData | PushButtonData | LedData | GateData;

export const LED_COLORS: Record<LedColor, string> = {
  red: 'hsl(0, 85%, 55%)',
  blue: 'hsl(215, 90%, 55%)',
  green: 'hsl(142, 70%, 45%)',
  yellow: 'hsl(45, 95%, 55%)',
  pink: 'hsl(330, 80%, 60%)',
  white: 'hsl(0, 0%, 92%)',
};

export const LED_COLORS_DIM: Record<LedColor, string> = {
  red: 'hsl(0, 30%, 30%)',
  blue: 'hsl(215, 30%, 30%)',
  green: 'hsl(142, 25%, 28%)',
  yellow: 'hsl(45, 30%, 30%)',
  pink: 'hsl(330, 25%, 30%)',
  white: 'hsl(0, 0%, 40%)',
};
