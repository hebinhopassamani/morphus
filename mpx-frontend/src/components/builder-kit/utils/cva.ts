import { cn } from 'cn';
import { defineConfig } from 'cva/config';

export type { VariantProps } from 'cva/config';

export const { cva } = defineConfig({ cx: cn });
