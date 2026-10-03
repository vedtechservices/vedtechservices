import type { ReactNode } from 'react';

interface PageMetaProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  keywords?: string;
  structuredData?: object | object[];
}

export const LegacyHelmet = ({ children: _children }: { children?: ReactNode }) => null;

const PageMeta = (_props: PageMetaProps) => null;

export default PageMeta;
