import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './App.jsx';
import './index.css';

// vite-react-ssg drives both `vite-react-ssg dev` and `vite-react-ssg build`.
// The build step crawls the route list and emits real HTML files per route,
// which is the SEO foundation per docs/seo-strategy.md.
export const createRoot = ViteReactSSG({ routes });
